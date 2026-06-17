export default class UI {
    
    // --- Buttons ---
    static RESET_BUTTON = document.getElementById("resetButton");
    static CLASS_BUTTON = document.getElementById("classButton");
    static ATTR_BUTTON = document.getElementById("attrButton");
    static LOCK_BUTTON = document.getElementById("lockButton");
    static ADD_TRAIN_BUTTON = document.getElementById("addTrainButton");
    static RESET_TRAIN_BUTTON = document.getElementById("resetTrainButton");
    static TRAIN_BUTTON = document.getElementById("trainButton");
    static TEST_BUTTON = document.getElementById("testButton");  
    
    // --- Inputs ---
    static CLASS_INPUT = document.getElementById("classInput");
    static ATTR_INPUT = document.getElementById("attrInput");
    static TRAIN_INPUT = document.getElementById("trainInput");
    static TEST_INPUT = document.getElementById("testInput");

    // --- Cards ---
    static PARAM_CARD = document.getElementById("paramCard");
    static TRAIN_CARD = document.getElementById("trainCard");
    static TEST_CARD = document.getElementById("testCard");

    // --- Tree ---
    static TREE = document.getElementById("treeSvg");
    static TREE_WIDTH = 920;
    static TREE_HEIGHT = 320;

    // --- Forms ---
    static TRAIN_FORM = document.getElementById("trainForm");
    static TEST_FORM = document.getElementById("testForm");

    // --- Selects ---
    static CLASS_DROPDOWN = document.getElementById("classDropdown");
    static CLASS_SELECT = document.getElementById("classSelect");
}