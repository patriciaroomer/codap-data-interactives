# PRD: Fix Speed Slider Playback Interruption

## Problem Statement

When playback is running and the user adjusts the Speed slider, it causes the playback to stop and moves the sonificationTracker back to the beginning of the dataset. The user then has to push the play/pause button several times to get it to play again. This creates a poor user experience where adjusting speed during playback is disruptive rather than seamless.

## Current Behavior

1. User starts playback
2. User adjusts the speed slider during playback
3. Playback stops unexpectedly
4. SonificationTracker resets to the beginning
5. User must press play/pause multiple times to resume playback
6. Playback starts from the beginning instead of continuing from where it was

## Expected Behavior

1. User starts playback
2. User adjusts the speed slider during playback
3. Playback speed changes immediately without stopping
4. SonificationTracker continues from current position
5. No additional user interaction required
6. Playback continues seamlessly at the new speed

## Root Cause Analysis

The issue is in the speed slider's "release" event handler in `Sonify/src/app.js` (lines 337-350):

```javascript
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
```

The problematic sequence is:
1. `this.stopNotes()` stops the current playback
2. `this.play()` restarts playback, which triggers a complex state transition logic
3. The state transition logic in `play()` method resets the phase to the beginning under certain conditions

## Technical Solution

### Option 1: Update Speed Without Restarting (Recommended)

Modify the speed slider handler to only update the CSound playback speed channel without stopping and restarting playback:

```javascript
this.speedSlider.on("release", (/*v*/) => {
  this.state.playbackSpeed = this.speedSlider._value.value;

  if (this.csoundReady) {
    csound.SetChannel("playbackSpeed", this.state.playbackSpeed);
    // Remove the stop/restart logic - CSound can handle speed changes in real-time
  }
});
```

### Option 2: Preserve Phase During Restart (Alternative)

If restarting is necessary for some technical reason, ensure the phase is preserved:

```javascript
this.speedSlider.on("release", (/*v*/) => {
  this.state.playbackSpeed = this.speedSlider._value.value;

  if (this.csoundReady) {
    csound.SetChannel("playbackSpeed", this.state.playbackSpeed);

    if (this.playing) {
      const currentPhase = csound.RequestChannel("phase");
      this.stopNotes();
      this.phase = currentPhase; // Preserve the current phase
      this.setupSound(); // Use setupSound instead of play() to avoid state transition logic
    }
  }
});
```

## Implementation Details

### Files to Modify
- `Sonify/src/app.js` - Speed slider event handler (lines 337-350)

### Testing Scenarios
1. **Basic speed change during playback**: Start playback, adjust speed slider, verify playback continues without interruption
2. **Multiple speed changes**: Adjust speed multiple times during playback, verify smooth transitions
3. **Speed change during selection-scoped playback**: Test with data selection active
4. **Speed change during looped playback**: Test with loop mode enabled
5. **Speed change with smooth sound enabled**: Test with continuous sound mode
6. **Pause/resume after speed change**: Verify pause/resume still works correctly after speed adjustment

### Success Criteria
- [ ] Speed slider adjustments during playback do not stop playback
- [ ] SonificationTracker continues from current position after speed change
- [ ] No additional button presses required after speed adjustment
- [ ] Speed changes are applied immediately and audibly
- [ ] All existing playback modes (selection-scoped, looping, smooth sound) work correctly with speed changes
- [ ] Pause/resume functionality remains unaffected

### Risk Assessment
- **Low Risk**: Option 1 (recommended) simply removes problematic code
- **Medium Risk**: Option 2 requires careful phase management
- **Regression Risk**: Minimal - only affects speed slider behavior during playback

## Notes

The current behavior where speed changes work fine when paused indicates that the CSound engine can handle speed changes without requiring a full restart. The issue is specifically with the unnecessary stop/restart cycle during active playback. 