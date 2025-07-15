/*global codapInterface:true*/
import packageInfo from "../package.json";
import Vue from "vue";
import Nexus from "nexusui";
import { default as CodapPluginHelper } from "./CodapPluginHelper.js";
import * as localeManager from "./localeManager.js";

const helper = new CodapPluginHelper(codapInterface);
/**
 * Replicates the csound scale function.
 * Scales a number between zero and one to the given range.
 * Note the inversion of max and min in the argument list.
 **/
function scale(v, max, min) {
  return v * (max - min) + min;
}

/**
 * Replicates csound expcurve function.
 * @param x
 * @param y
 * @returns {number}
 */
function expcurve(x, y) {
  return (Math.exp(x * Math.log(y)) - 1) / (y - 1);
}

function flattenGroupedArrays(data) {
  if (Array.isArray(data)) {
    return data;
  } else if (data) {
    return Object.values(data).flatMap(flattenGroupedArrays);
  }
}

function hashMapById(array) {
  return array.reduce((result, item) => {
    result[item.id] = item;
    return result;
  }, {});
}

const PLAY_TOGGLE_IDLE = false;
const PLAY_TOGGLE_PLAYING = true;

const kAttributeMappedProperties = [
  "time",
  "pitch", //,
  // 'duration',
  // 'loudness',
  // 'stereo'
];

const trackingGlobalName = "sonificationTracker";
const minDur = 0.02;
const maxDur = 0.5;
// const durRange = maxDur - minDur;

const minPitchMIDI = 48;
const maxPitchMIDI = 96;
// const pitchMIDIRange = maxPitchMIDI - minPitchMIDI;

const FOCUS_MODE = "Focus";
const CONTRAST_MODE = "Contrast";
const CONNECT_MODE = "Connect";

const UNSELECT_VALUE = "NULL";

const app = new Vue({
  el: "#app",
  data: {
    name: "Sonify",
    version: packageInfo.version,
    dim: {
      width: 325,
      height: 425,
    },
    loading: true,
    // state managed by CODAP
    state: {
      focusedContext: "",
      focusedCollection: "",
      pitchAttribute: "",
      pitchAttrIsDate: false,
      pitchAttrIsDescending: false,
      timeAttribute: "",
      timeAttrIsDate: false,
      timeAttrIsDescending: false,
      durationAttribute: "",
      durationAttrIsDate: false,
      durationAttrIsDescending: false,
      loudnessAttribute: "",
      loudnessAttrIsDate: false,
      loudnessAttrIsDescending: false,
      stereoAttribute: "",
      stereoAttrIsDate: false,
      stereoAttrIsDescending: false,
      connectByCollIds: null,
      playbackSpeed: 0.5,
      loop: false,
      selectionMode: FOCUS_MODE,
    },
    data: null,
    contexts: null, // array of context names
    collections: null,
    attributes: null,

    connectByAvailable: true,

    globals: [],

    pitchAttrRange: null,
    pitchArray: [],

    timeAttrRange: null,
    timeArray: [],

    durationAttrRange: null,
    durationArray: [],

    loudnessAttrRange: null,
    loudnessArray: [],

    stereoAttrRange: null,
    stereoArray: [],

    csdFiles: ["Sonify.csd"],
    selectedCsd: null,
    csoundReady: false,

    synchronized: false,

    // Remove all playToggle-related logic and references
    playing: false,

    speedSlider: null,
    loopToggle: null,
    userMessage: null,
    timerId: null,
    phase: 0,
    cycleEndTimerId: null,
    selectionModes: [FOCUS_MODE, CONNECT_MODE],
    l: localeManager,
  },
  watch: {
    state: {
      handler(newState /*, oldState*/) {
        helper.updateState(newState);
      },
      deep: true,
    },
  },
  methods: {
    setupUI() {
      this.setUserMessage("DG.plugin.sonify.noDatasetMessage");
      // Add play/pause button using NexusUI
      this.playPauseButton = new Nexus.Button("#play-pause-button", {
        size: [25, 25],
        mode: "toggle",
        state: false
      });
      // Override render to add SVG play/pause icon
      const playPath = "M8 5v14l11-7z"; // Play triangle
      const pausePath = "M6 4h4v16H6V4zm8 0h4v16h-4V4z"; // Pause bars
      const button = this.playPauseButton;
      // Add icon element if not present
      if (!button.iconElement) {
        button.iconElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        button.element.appendChild(button.iconElement);
        // Ensure clicking the icon triggers the button
        button.iconElement.style.pointerEvents = 'auto';
        button.iconElement.addEventListener('click', (e) => {
          e.stopPropagation();
          button.interactionTarget.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true}));
          button.interactionTarget.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, cancelable: true}));
        });
      }
      button.render = function() {
        // Call original render
        Nexus.Button.prototype.render.call(this);
        // Set icon path and color
        if (this.state) {
          this.iconElement.setAttribute("d", pausePath);
        } else {
          this.iconElement.setAttribute("d", playPath);
        }
        this.iconElement.setAttribute("fill", this.state ? this.colors.fill : this.colors.dark);
        // Center the icon perfectly in the pad
        const iconSize = 16; // SVG path is designed for 24x24, but we want 16x16 for better centering
        const centerX = this.width / 2 - iconSize / 2;
        const centerY = this.height / 2 - iconSize / 2;
        this.iconElement.setAttribute("transform", `translate(${centerX}, ${centerY}) scale(${iconSize/24})`);
        // Set pad outline to NexusUI accent color
        this.pad.setAttribute("stroke", this.colors.accent);
      };
      // Initial render
      this.playPauseButton.render();
      // Add play/pause logic
      this.playPauseButton.on("change", (isPlaying) => {
        if (isPlaying) {
          this.setUserMessage("DG.plugin.sonify.playingMessage");
          this.play();
        } else {
          this.setUserMessage("DG.plugin.sonify.stoppingMessage");
          this.resetPlay(false);
        }
      });
      // Ensure button state reflects playback status if stopped elsewhere
      this.$watch('playing', (newVal) => {
        if (this.playPauseButton.state !== newVal) {
          this.playPauseButton.state = newVal;
        }
      });

      // Add reset button using NexusUI, matching play button size and style
      this.resetButton = new Nexus.Button("#reset-button", {
        size: [25, 25],
        mode: "button",
        state: false
      });
      // Use the provided SVG path for the reset icon
      const resetPath = "M106.2,22.2c1.78,2.21,3.43,4.55,5.06,7.46c5.99,10.64,8.52,22.73,7.49,34.54c-1.01,11.54-5.43,22.83-13.37,32.27 c-2.85,3.39-5.91,6.38-9.13,8.97c-11.11,8.93-24.28,13.34-37.41,13.22c-13.13-0.13-26.21-4.78-37.14-13.98 c-3.19-2.68-6.18-5.73-8.91-9.13C6.38,87.59,2.26,78.26,0.71,68.41c-1.53-9.67-0.59-19.83,3.07-29.66 c3.49-9.35,8.82-17.68,15.78-24.21C26.18,8.33,34.29,3.76,43.68,1.48c2.94-0.71,5.94-1.18,8.99-1.37c3.06-0.2,6.19-0.13,9.4,0.22 c2.01,0.22,3.46,2.03,3.24,4.04c-0.22,2.01-2.03,3.46-4.04,3.24c-2.78-0.31-5.49-0.37-8.14-0.2c-2.65,0.17-5.23,0.57-7.73,1.17 c-8.11,1.96-15.1,5.91-20.84,11.29C18.43,25.63,13.72,33,10.62,41.3c-3.21,8.61-4.04,17.51-2.7,25.96 c1.36,8.59,4.96,16.74,10.55,23.7c2.47,3.07,5.12,5.78,7.91,8.13c9.59,8.07,21.03,12.15,32.5,12.26c11.47,0.11,23-3.76,32.76-11.61 c2.9-2.33,5.62-4.98,8.13-7.97c6.92-8.22,10.77-18.09,11.66-28.2c0.91-10.37-1.32-20.99-6.57-30.33c-1.59-2.82-3.21-5.07-5.01-7.24 l-0.53,14.7c-0.07,2.02-1.76,3.6-3.78,3.52c-2.02-0.07-3.6-1.76-3.52-3.78l0.85-23.42c0.07-2.02,1.76-3.6,3.78-3.52 c0.13,0,0.25,0.02,0.37,0.03l0,0l22.7,3.19c2,0.28,3.4,2.12,3.12,4.13c-0.28,2-2.12,3.4-4.13,3.12L106.2,22.2L106.2,22.2z";
      const resetButton = this.resetButton;
      if (!resetButton.iconElement) {
        resetButton.iconElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        resetButton.element.appendChild(resetButton.iconElement);
        // Tooltip for accessibility
        resetButton.element.setAttribute("title", this.l.tr("DG.plugin.sonify.resetTooltip"));
        // Ensure clicking the icon triggers the button
        resetButton.iconElement.style.pointerEvents = 'auto';
        resetButton.iconElement.addEventListener('click', (e) => {
          e.stopPropagation();
          resetButton.interactionTarget.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true}));
          resetButton.interactionTarget.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, cancelable: true}));
        });
      }
      resetButton.render = function() {
        Nexus.Button.prototype.render.call(this);
        this.iconElement.setAttribute("d", resetPath);
        this.iconElement.setAttribute("fill", "#000");
        this.iconElement.setAttribute("stroke", "#000");
        this.iconElement.setAttribute("stroke-width", "3");
        // Center and scale the icon to fit 16x16 area (original viewBox is 122.88x118.66)
        const iconSize = 16;
        const scaleX = iconSize / 122.88;
        const scaleY = iconSize / 118.66;
        const centerX = this.width / 2 - iconSize / 2;
        const centerY = this.height / 2 - iconSize / 2;
        this.iconElement.setAttribute("transform", `translate(${centerX}, ${centerY}) scale(${scaleX},${scaleY})`);
        // Set pad outline to NexusUI accent color
        this.pad.setAttribute("stroke", this.colors.accent);
      };
      this.resetButton.render();
      // Add click event handler for reset button
      this.resetButton.on("change", () => {
        this.resetPlay(true);
      });

      // this.playToggle = new Nexus.Toggle("#play-toggle", {
      //   size: [40, 20],
      //   state: false,
      // });

      // this.playToggle.on("change", (v) => {
      //   if (v) {
      //     this.setUserMessage("DG.plugin.sonify.playingMessage");
      //     this.play();
      //   } else {
      //     this.setUserMessage("DG.plugin.sonify.stoppingMessage");
      //     this.resetPlay();
      //   }
      // });

      this.loopToggle = new Nexus.Toggle("#loop-toggle", {
        size: [40, 20],
        state: this.state.loop,
      });

      this.loopToggle.on("change", (v) => {
        this.state.loop = v;

        this.cycleEndTimerId && clearTimeout(this.cycleEndTimerId);

        if (this.playing) {
          const phase = csound.RequestChannel("phase");
          let gkfreq = expcurve(this.state.playbackSpeed, 50);
          gkfreq = expcurve(gkfreq, 50);
          gkfreq = scale(gkfreq, 5, 0.05);
          const remainingPlaybackTime = ((1 - phase) / gkfreq) * 1000;

          if (this.state.loop) {
            this.cycleEndTimerId = setTimeout(
              () => this.triggerNotes(0),
              remainingPlaybackTime,
            );
          } else {
            this.cycleEndTimerId = setTimeout(() => {
              this.resetPlay();
            }, remainingPlaybackTime);
          }
        }
      });

      this.speedSlider = new Nexus.Slider("#speed-slider", {
        size: [200, 20],
        mode: "absolute",
        value: this.state.playbackSpeed,
      });

      this.speedSlider.on("release", (/*v*/) => {
        this.state.playbackSpeed = this.speedSlider._value.value;

        if (this.csoundReady) {
          csound.SetChannel("playbackSpeed", this.state.playbackSpeed);

          if (this.playing) {
            this.phase = csound.RequestChannel("phase");
            this.stopNotes();
            this.play();
          }
        }
      });
      // Undo: Make the entire button area clickable
      // (Restore default: only the pad is clickable)
      // this.playPauseButton.interactionTarget = this.playPauseButton.element;
    },
    setUserMessage(msgKey, ...args) {
      this.userMessage = localeManager.tr(msgKey, args);
    },
    logMessage(msg) {
      this.setUserMessage("log: %1", msg);
      console.log(`MicroRhythm: ${msg}`);
    },
    setupDrag() {
      function findElementsUnder(pos) {
        if (pos) {
          return document
            .elementsFromPoint(pos.x, pos.y)
            .filter((el) => el.classList.contains("drop-area"));
        }
      }
      helper.on("dragDrop[attribute]", "dragenter", (data) => {
        let els = findElementsUnder(data.values.position);
        if (els) {
          els.forEach((el) => {
            el.style.backgroundColor = "rgba(255,255,0,0.5)";
          });
        }
      });

      helper.on("dragDrop[attribute]", "dragleave", (data) => {
        let els = findElementsUnder(data.values.position);
        if (els) {
          els.forEach((el) => {
            el.style.backgroundColor = "transparent";
          });
        }
      });

      helper.on("dragDrop[attribute]", "drag", (data) => {
        document.querySelectorAll(".drop-area").forEach((el) => {
          el.style.backgroundColor = "transparent";
        });
        let els = findElementsUnder(data.values.position);
        els.forEach((el) => {
          el.style.backgroundColor = "rgba(255,255,0,0.5)";
        });
      });

      helper.on("dragDrop[attribute]", "drop", (data) => {
        let els = findElementsUnder(data.values.position);
        if (
          this.contexts &&
          this.contexts.includes(data.values.context.name) &&
          this.state.focusedContext !== data.values.context.name
        ) {
          this.state.focusedContext = data.values.context.name;
          this.onContextFocused();
        }

        els.forEach((el) => {
          if (
            this.attributes &&
            this.attributes.includes(data.values.attribute.name)
          ) {
            if (el.id.startsWith("pitch")) {
              this.state.pitchAttribute = data.values.attribute.name;
              this.onPitchAttributeSelectedByUI();
            } else if (el.id.startsWith("time")) {
              this.state.timeAttribute = data.values.attribute.name;
              this.onTimeAttributeSelectedByUI();
            }
          }
        });
      });

      helper.on("dragDrop[attribute]", "dragstart", (/*data*/) => {
        document.querySelectorAll(".drop-area").forEach((el) => {
          el.style.outline = "3px solid #ffff00";
        });
      });

      helper.on("dragDrop[attribute]", "dragend", (/*data*/) => {
        document.querySelectorAll(".drop-area").forEach((el) => {
          el.style.outline = "3px solid transparent";
          el.style.backgroundColor = "transparent";
        });
      });
    },
    /**
     * Updates the CODAP Global Value with the current time offset within
     * the current score.
     */
    updateTracker() {
      if (this.timeAttrRange) {
        let cyclePos = 0;
        try {
          cyclePos = csound.RequestChannel("phase") || 0;
        } catch (ex) {
          console.warn("CSound phase undefined. Assuming 0.");
        }
        // For obscure reasons CODAP Time is measured in seconds,
        // not milliseconds. Normally this adjustment is automatic.
        // In order for the sonification tracker to align with the
        // data we need to take this obscurity into account
        const timeAdj = this.state.timeAttrIsDate ? 1000 : 1;

        // Except in the CONNECT mode, the note events (time offsets)
        // are slightly compressed to end the last note event at time=1.
        const modeAdj =
          this.state.selectionMode === CONNECT_MODE
            ? 1
            : (this.timeAttrRange.len - 1) / this.timeAttrRange.len;

        const dataTime = scale(
          cyclePos / modeAdj,
          this.timeAttrRange.max / timeAdj,
          this.timeAttrRange.min / timeAdj,
        );
        helper.setGlobal(trackingGlobalName, dataTime);
      }
    },
    resetPitchTimeMaps() {
      this.state.pitchAttribute = this.state.timeAttribute = null;
      this.state.pitchAttrRange = this.timeAttrRange = null;
    },
    onContextFocused() {
      this.collections = helper.getCollectionsForContext(
        this.state.focusedContext,
      );
      this.attributes = helper.getAttributeNamesForContext(
        this.state.focusedContext,
      );

      this.resetPitchTimeMaps();
    },
    getAttributeType(context, attrName) {
      let attributes = helper.getAttributeDefsForContext(context);
      let attr =
        attributes && attributes.find((attr) => attrName === attr.name);
      if (attr) return attr.type;
    },
    setIfDateTimeAttribute(type) {
      let contextName = this.state.focusedContext;
      let attrName = this.state[`${type}Attribute`];
      let attrType = this.getAttributeType(contextName, attrName);
      let values = helper.getAttrValuesForContext(contextName, attrName) || [];
      // an attribute is a Date attribute if attribute type is 'date' or
      // all of its values are Date objects or date strings
      let isDateAttribute =
        attrType === "date" ||
        (values.length > 0 &&
          !values.some((x) => {
            let isDate =
              x instanceof Date ||
              (typeof x === "string" &&
                !isNaN(new Date(x).valueOf()) &&
                isNaN(x));
            return !isDate;
          }));
      this.state[`${type}AttrIsDate`] = isDateAttribute;
    },
    /**
     * @param type {string} pitch, time, loudness, or stereo
     **/
    processMappedAttribute(type) {
      if (this.checkIfGlobal(this.state[`${type}Attribute`])) {
        this[`${type}AttrRange`] = {
          len: 1,
          min: 0,
          max: 1,
        };
      } else {
        this.setIfDateTimeAttribute(type);
        this[`${type}AttrRange`] = this.calcRange(
          this.state[`${type}Attribute`],
          this.state[`${type}AttrIsDate`],
          this.state[`${type}AttrIsDescending`],
        );
        this.updateTracker();
      }

      this.reselectCases();
    },
    onBackgroundSelect() {
      helper.selectSelf();
    },
    onSelectionModeSelectedByUI() {
      this.reselectCases();
    },
    onPitchAttributeSelectedByUI() {
      this.setUserMessage(
        this.state.pitchAttribute
          ? "DG.plugin.sonify.selectPitchMessage"
          : "DG.plugin.sonify.deselectPitchMessage",
      );
      this.processMappedAttribute("pitch");

      if (this.playing) {
        this.phase = csound.RequestChannel("phase");
        this.stopNotes();
        this.play();
      }
    },
    onTimeAttributeSelectedByUI() {
      this.setUserMessage(
        this.state.timeAttribute
          ? "DG.plugin.sonify.selectTimeMessage"
          : "DG.plugin.sonify.deselectTimeMessage",
      );
      this.processMappedAttribute("time");

      if (this.playing) {
        this.phase = csound.RequestChannel("phase");
        this.stopNotes();
        this.play();
      }
    },
    onConnectByCollectionSelectedByUI() {
      this.setUserMessage(
        this.state.focusedCollection
          ? "DG.plugin.sonify.connectByMessage"
          : "DG.plugin.sonify.disconnectMessage",
      );

      if (this.state.focusedCollection === UNSELECT_VALUE) {
        this.state.selectionMode = FOCUS_MODE;
      } else {
        this.state.selectionMode = CONNECT_MODE;
        const context = helper.data[this.state.focusedContext];
        const collection = context?.[this.state.focusedCollection];
        this.state.connectByCollIds = collection?.map((c) => c.id);
      }

      this.onSelectionModeSelectedByUI();
    },

    checkIfGlobal(attr) {
      return this.globals.some((g) => g.name === attr);
    },

    reselectCases() {
      this.getSelectedItems(this.state.focusedContext).then(
        this.onItemsSelected,
      );
    },

    onGetData() {
      this.contexts = helper.getContexts();
      if (this.contexts && this.contexts.length === 1) {
        this.state.focusedContext =
          this.state.focusedContext || this.contexts[0];
      }

      if (this.state.focusedContext) {
        let attrs = helper.getAttributeNamesForContext(
          this.state.focusedContext,
        );

        this.attributes = attrs;
        this.reselectCases();
        kAttributeMappedProperties.forEach((p) => {
          if (this[p + "AttrRange"]) {
            this.processMappedAttribute(p);
          }
        });

        // Re-populate the collections dropdown.
        const collections = helper.getCollectionsForContext(
          this.state.focusedContext,
        );

        // Filter out the collections with the size of items (the leaf nodes).
        const itemsLength = helper.items[this.state.focusedContext].length;
        this.collections = collections.filter(
          (collection) =>
            helper.data[this.state.focusedContext][collection]?.length !==
            itemsLength,
        );

        // Do not show the "connect by" dropdown UI if there are not hierarchies / collections.
        this.connectByAvailable = !!this.collections?.length;
      }
    },
    onGetGlobals() {
      this.globals = helper.globals;

      if (this.playing) {
        this.reselectCases();
      }
    },
    calcRange(attribute, isDateTime, inverted) {
      // let attrValues = helper.getAttributeValues(this.state.focusedContext, this.focusedCollection, attribute);
      let attrValues = attribute
        ? helper.getAttrValuesForContext(this.state.focusedContext, attribute)
        : [];

      if (attrValues) {
        if (isDateTime) {
          attrValues = attrValues
            .map(Date.parse)
            .filter((v) => !Number.isNaN(v));
        } else {
          attrValues = attrValues
            .map(parseFloat)
            .filter((v) => !Number.isNaN(v));
        }

        if (attrValues.length !== 0) {
          return {
            len: attrValues.length,
            min: inverted ? Math.max(...attrValues) : Math.min(...attrValues),
            max: inverted ? Math.min(...attrValues) : Math.max(...attrValues),
          };
        } else {
          return { len: 0, min: 0, max: 0 };
        }
      } else {
        return { len: 0, min: 0, max: 0 };
      }
    },

    prepMapping(args) {
      let param = args["param"];
      let items = args["items"];

      if (this[`${param}AttrRange`]) {
        let range =
          this[`${param}AttrRange`].max - this[`${param}AttrRange`].min;

        if (range === 0) {
          this[`${param}Array`] = items.map((c) => ({ id: c.id, val: 0.5 }));
        } else {
          if (this.checkIfGlobal(this.state[`${param}Attribute`])) {
            let global = this.globals.find(
              (g) => g.name === this.state[`${param}Attribute`],
            );
            let value =
              global.value > 1 ? 1 : global.value < 0 ? 0 : global.value;

            this[`${param}Array`] = items.map((c) => ({
              id: c.id,
              val: value,
            }));
          } else {
            this[`${param}Array`] = items.map((c) => {
              let value = this.state[`${param}AttrIsDate`]
                ? Date.parse(c.values[this.state[`${param}Attribute`]])
                : c.values[this.state[`${param}Attribute`]];
              value = isNaN(parseFloat(value))
                ? NaN
                : (value - this[`${param}AttrRange`].min) / range;
              return { id: c.id, val: value };
            });
          }
        }
      }
    },

    onItemsSelected(items) {
      const { selectionMode, timeAttrIsDate, timeAttribute } = this.state;

      // TODO: Does this only include all the leaf nodes or also the grouping nodes? Double check.
      const allItems = helper.getItemsForContext(this.state.focusedContext);

      let connectedCasesById;
      let selectedItemIdsSet;

      if (selectionMode === CONNECT_MODE) {
        const context = helper.data[this.state.focusedContext];
        const flattenedGroupedCases = flattenGroupedArrays(context);
        connectedCasesById = hashMapById(flattenedGroupedCases);
        selectedItemIdsSet = new Set(items.map((item) => item.id));

        if (timeAttrIsDate) {
          allItems.sort(
            (a, b) =>
              Date.parse(a.values[timeAttribute]) -
              Date.parse(b.values[timeAttribute]),
          );
        } else {
          allItems.sort(
            (a, b) => a.values[timeAttribute] - b.values[timeAttribute],
          );
        }
      }

      if (this.timeAttrRange) {
        let range = this.timeAttrRange.max - this.timeAttrRange.min;

        if (range === 0) {
          if (selectionMode === CONTRAST_MODE) {
            const idItemMap = allItems.reduce(
              (acc, curr) => (
                (acc[curr.id] = { id: curr.id, val: 0, sel: false }), acc
              ),
              {},
            );
            items.forEach((c) => (idItemMap[c.id].sel = true));
            this.timeArray = Object.values(idItemMap);
          } else {
            this.timeArray = items.map((c) => ({ id: c.id, val: 0 }));
          }
        } else {
          if (this.checkIfGlobal(timeAttribute)) {
            let global = this.globals.find((g) => g.name === timeAttribute);
            let value =
              global.value > 1 ? 1 : global.value < 0 ? 0 : global.value;

            if (selectionMode === CONTRAST_MODE) {
              const idItemMap = allItems.reduce(
                (acc, curr) => (
                  (acc[curr.id] = { id: curr.id, val: value, sel: false }), acc
                ),
                {},
              );
              items.forEach((c) => (idItemMap[c.id].sel = true));
              this.timeArray = Object.values(idItemMap);
            } else {
              this.timeArray = items.map((c) => ({ id: c.id, val: value }));
            }
          } else {
            if (selectionMode === CONTRAST_MODE) {
              const idItemMap = allItems.reduce((acc, curr) => {
                const value = this.state.timeAttrIsDate
                  ? Date.parse(curr.values[timeAttribute])
                  : curr.values[timeAttribute];
                // The last event's time offset should be `(1 - event duration)`.
                const valueScaled = isNaN(parseFloat(value))
                  ? NaN
                  : ((value - this.timeAttrRange.min) / range) *
                    ((this.timeAttrRange.len - 1) / this.timeAttrRange.len);
                acc[curr.id] = { id: curr.id, val: valueScaled, sel: false };
                return acc;
              }, {});

              items.forEach((c) => (idItemMap[c.id].sel = true));
              this.timeArray = Object.values(idItemMap);
            } else if (selectionMode === CONNECT_MODE) {
              this.timeArray = allItems.map((c) => {
                let value = timeAttrIsDate
                  ? Date.parse(c.values[timeAttribute])
                  : c.values[timeAttribute];
                // The last event's time offset should be 1.
                value = isNaN(parseFloat(value))
                  ? NaN
                  : (value - this.timeAttrRange.min) / range;
                const parent = connectedCasesById?.[c.id]?.parent;
                const selected = selectedItemIdsSet.has(c.id);
                return { id: c.id, val: value, parent, selected };
              });
            } else {
              this.timeArray = items.map((c) => {
                let value = timeAttrIsDate
                  ? Date.parse(c.values[timeAttribute])
                  : c.values[timeAttribute];
                value = isNaN(parseFloat(value))
                  ? NaN
                  : ((value - this.timeAttrRange.min) / range) *
                    ((this.timeAttrRange.len - 1) / this.timeAttrRange.len);
                return { id: c.id, val: value };
              });
            }
          }
        }
      }

      // ['pitch', 'duration', 'loudness', 'stereo'].forEach(param => this.prepMapping({ param: param, items: CONTRAST_MODE ? allItems : items }));
      this.prepMapping({
        param: "pitch",
        items: [CONTRAST_MODE, CONNECT_MODE].includes(selectionMode)
          ? allItems
          : items,
      });

      if (this.playing) {
        this.phase = csound.RequestChannel("phase");
        this.stopNotes();
        this.play();
      }
    },
    stopNotes() {
      csound.Event("e");
    },
    /**
     * Sets sound play and related state to its initial condition:
     *   * sound is stopped
     *   * the UI Play toggle is stopped
     *   * the phase and tracking global are at their minimum value
     */
    resetPlay(isTrueReset = false) {
      this.stop();
      if (isTrueReset) {
        this.phase = 0;
        let timeAdj = this.state.timeAttrIsDate ? 1000 : 1;
        let trackerMin = this.timeAttrRange
          ? this.timeAttrRange.min / timeAdj
          : 0;
        helper.setGlobal(trackingGlobalName, trackerMin);
      } else {
        // Store current phase for resume
        try {
          this.phase = csound.RequestChannel("phase") || 0;
        } catch (ex) {
          this.phase = 0;
        }
      }
    },
    triggerNotes(phase) {
      const { playbackSpeed, loop, selectionMode } = this.state;
      const pitchTimeArrayLengthsMatch =
        this.pitchArray.length === this.timeArray.length;

      let gkfreq = expcurve(playbackSpeed, 50);
      gkfreq = expcurve(gkfreq, 50);
      gkfreq = scale(gkfreq, 5, 0.05);

      const remainingPlaybackTime = (1 - phase) / gkfreq;

      if (loop) {
        this.cycleEndTimerId = setTimeout(
          () => this.triggerNotes(0),
          remainingPlaybackTime * 1000,
        );
      } else {
        this.cycleEndTimerId = setTimeout(() => {
          this.phase = 0; // Reset phase to zero at end of playback
          this.resetPlay(true);
        }, remainingPlaybackTime * 1000);
      }

      if (!pitchTimeArrayLengthsMatch) {
        console.warn(
          `pitch not rendered: [pitchArray length, timeArray length]: [${[
            this.pitchArray.length,
            this.timeArray.length,
          ].join()}]`,
        );
      }

      if (selectionMode === CONNECT_MODE) {
        const pitchArrayById = this.pitchArray.reduce(
          (res, v) => ((res[v.id] = v), res),
          {},
        );
        this.state.connectByCollIds.forEach((id) => {
          const timeArrayForGroup = this.timeArray.filter(
            (v) => v.parent === id,
          );

          for (let i = 0; i < timeArrayForGroup.length - 1; i++) {
            const startTime = (timeArrayForGroup[i].val - phase) / gkfreq;
            const endTime = (timeArrayForGroup[i + 1].val - phase) / gkfreq;
            const timeDelta = endTime - startTime;
            const startPitch =
              pitchArrayById[timeArrayForGroup[i].id]?.val ?? 0.5;
            const endPitch =
              pitchArrayById[timeArrayForGroup[i + 1].id]?.val ?? 0.5;
            // const loudness = 0.5;

            const unmute = timeArrayForGroup[i].selected ? 1 : 0;

            // The last event of the group should not "hold" the note
            // as there might be other groups (voices) that would play
            // past the endTime, resulting in an incorrectly held note.
            const hold = i === timeArrayForGroup.length - 2 ? timeDelta : -1;

            if (![startTime, timeDelta, startPitch, endPitch].some(isNaN)) {
              csound.Event(
                `i 4.${id} ${startTime} ${hold} ${unmute} ${startPitch} ${endPitch} ${timeDelta}`,
              );
            }
          }
        });
      } else {
        this.timeArray.forEach((d, i) => {
          const pitch = pitchTimeArrayLengthsMatch
            ? this.pitchArray[i].val
            : 0.5;
          // let duration = this.durationArray.length === this.timeArray.length ? this.durationArray[i].val : 0.5;
          // let loudness = this.loudnessArray.length === this.timeArray.length ? this.loudnessArray[i].val * 0.95 + 0.05 : 0.5;
          // let stereo = this.stereoArray.length === this.timeArray.length ? this.stereoArray[i].val : 0.5;

          const loudness = 0.5;
          const duration = 0.2;

          if (d.val >= phase && ![d.val, pitch].some(isNaN)) {
            if (selectionMode === CONTRAST_MODE) {
              const instr = d.sel ? 3 : 2;
              csound.Event(
                `i${instr} ${
                  (d.val - phase) / gkfreq
                } ${duration} ${pitch} ${loudness}`,
              );
            } else if (selectionMode === FOCUS_MODE) {
              csound.Event(
                `i2 ${
                  (d.val - phase) / gkfreq
                } ${duration} ${pitch} ${loudness}`,
              );
            }
          }
        });
      }
    },
    setupSound() {
      this.stop();

      return csound.PlayCsd(this.selectedCsd).then(() => {
        this.playing = true;
        this.startTime = Date.now();
        csound.SetChannel("playbackSpeed", this.state.playbackSpeed);
        csound.SetChannel("click", this.state.loop ? 1 : 0); // Loop is now also mapped to click on/off.
        csound.Event(`i1 0 -1 ${this.phase}`);

        this.timerId = setInterval(() => {
          this.updateTracker();
        }, 33); // 30 FPS

        if (this.timeArray.length !== 0) {
          this.triggerNotes(this.phase);
        }
      });
    },
    play() {
      if (!this.csoundReady) {
        // if (this.playToggle.state === PLAY_TOGGLE_PLAYING)
        //   this.playToggle.state = PLAY_TOGGLE_IDLE;
        this.setUserMessage("DG.plugin.sonify.notReadyMessage");
        return null;
      }

      if (!this.state.pitchAttribute || !this.state.timeAttribute) {
        // if (this.playToggle.state === PLAY_TOGGLE_PLAYING)
        //   this.playToggle.state = PLAY_TOGGLE_IDLE;
        this.setUserMessage("DG.plugin.sonify.missingPitchOrTimeMessage");
        return null;
      }

      if (CSOUND_AUDIO_CONTEXT.state !== "running") {
        return CSOUND_AUDIO_CONTEXT.resume().then(this.setupSound);
      } else {
        return this.setupSound();
      }
    },
    stop() {
      if (!this.csoundReady) {
        return null;
      }

      this.timerId && clearInterval(this.timerId);
      csound.Stop();
      csound.Csound.reset(); // Ensure the playback position, etc. are reset.
      this.playing = false;

      this.cycleEndTimerId && clearTimeout(this.cycleEndTimerId);
      this.cycleEndTimerId = null;
    },
    openInfoPage() {
      this.setUserMessage("DG.plugin.sonify.openInfoMessage");
      helper.openSharedInfoPage();
    },
    restoreSavedState(state) {
      Object.keys(state).forEach((key) => {
        this.state[key] = state[key];
      });
      if (this.state.playbackSpeed != null) {
        this.speedSlider.value = this.state.playbackSpeed;
      }
      if (this.state.loop != null) {
        this.loopToggle.state = this.state.loop;
      }
      helper
        .queryAllData()
        .then(this.onGetData)
        .then(() => {
          if (this.state.focusedContext) {
            this.attributes = helper.getAttributeNamesForContext(
              this.state.focusedContext,
            );
          }
          kAttributeMappedProperties.forEach((p) => {
            if (this.state[p + "Attribute"]) {
              this.processMappedAttribute(p);
            }
          });
        });
    },
    handleCODAPNotice(notice) {
      // console.log(`CODAP Notice: ${JSON.stringify(notice)}`)
      if (!helper.checkNoticeIdentity(notice)) {
        return null;
      }

      if (notice.resource === "documentChangeNotice") {
        helper.queryAllData().then(this.onGetData);
      } else if (notice.resource.includes("dataContextChangeNotice")) {
        let contextName = notice.resource.split("[").pop().split("]")[0];
        let operation = notice.values.operation;

        if (operation === "updateDataContext") {
          helper.queryContextList().then(() => {
            this.contexts = helper.getContexts();
          });
        } else if (operation === "updateAttributes") {
          this.resetPlay(true);
          this.onGetData();
        } else {
          if (operation === "selectCases") {
            if (contextName === this.state.focusedContext) {
              this.getSelectedItems(this.state.focusedContext).then(
                this.onItemsSelected,
              );
            }
          } else if (
            [
              "createCases",
              "deleteCases",
              "updateCases",
              "createCollection",
              "deleteCollection",
              "moveAttribute",
            ].includes(operation)
          ) {
            helper.queryDataForContext(contextName).then(this.onGetData);
          }
        }
      }
    },
    createGraph() {
      let timeAttr = this.state.timeAttribute;
      let pitchAttr = this.state.pitchAttribute;
      if (timeAttr && pitchAttr) {
        // create the graph object
        helper
          .createGraph(
            this.state.focusedContext,
            this.state.timeAttribute,
            this.state.pitchAttribute,
          )
          .then((result) => {
            if (result.success) {
              let graphId = result.values.id;
              console.log(`created graph: graph id: ${graphId}`);
              helper.annotateDocument((doc) => {
                let graph = doc.components.find(
                  (component) => component.id === graphId,
                );
                let componentStorage = graph.componentStorage;
                let adornments =
                  componentStorage.plotModels[0].plotModelStorage.adornments;
                adornments.plottedValue = {
                  isVisible: true,
                  adornmentKey: "plottedValue",
                  expression: trackingGlobalName,
                };
                adornments.connectingLine = { isVisible: true };

                return doc;
              });
            } else {
              console.warn(
                `create graph failure: ${
                  result.values ? result.values.error : "unknown error"
                }`,
              );
            }
          });
      }
    },
    tr(key, args) {
      return this.l.tr(key, args);
    },
    getContextTitle(contextName) {
      return helper.getContextTitle(contextName);
    },
    async getSelectedItems(context) {
      let isStrict = [CONTRAST_MODE].includes(this.state.selectionMode);
      return await helper.getSelectedItems(context, !isStrict);
    },
  },
  async mounted() {
    this.setupDrag();
    this.setupUI();

    let state = await helper.init(this.name, this.dim, this.version);
    if (state && Object.keys(state).length) {
      this.restoreSavedState(state);
    } else {
      this.onGetData();
    }

    await helper.guaranteeGlobal(trackingGlobalName);
    this.updateTracker();

    helper.on("*", this.handleCODAPNotice);

    this.selectedCsd = this.csdFiles[0];
  },
  async beforeMount() {
    await localeManager.init();
  },
  computed: {
    isPlayable: function () {
      let playable = !!(this.state.timeAttribute && this.state.pitchAttribute);
      console.log(`playable = ${playable}`);
      return playable;
    },
  },
});

window.moduleDidLoad = function () {
  let loadingScreen = document.getElementsByClassName("loading-screen");
  loadingScreen[0].parentNode.removeChild(loadingScreen[0]);

  app.csoundReady = true;
  // app.play();
};
