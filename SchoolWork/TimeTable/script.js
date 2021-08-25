const defConfig = {
  mainClr: "211, 84, 0",
  borderRad: {
    card: 15,
    btn: 30,
  },
  bgClr: {
    clr: "25, 25, 25",
    opacity: 70,
    btn: {
      clr: "10, 10, 10",
      opacity: 50,
    },
  },
  font: {
    norm: "#eeeeee",
    theme: "#111111",
  },
  borderThickness: 2,
  blur: {
    cards: 8,
    nav: 2,
  },
  bgImg: {
    1080: "/SchoolWork/bg1080.webp",
    768: "/SchoolWork/bg768.webp",
    changed: false,
  },
};

let installPrompt;
let date = newDate();
let config = getConfig();
const html = $t("html");

const linkCardLiTemplate = (() => {
  const li = document.createElement("li");
  const timingAndStatus = addTimingAndStatus(li);
  timingAndStatus.appendChild(document.createElement("div"));
  addStatus(timingAndStatus);

  return li;
})();

function $(elem) {
  return document.querySelector(elem);
}

function $$(elems) {
  return document.querySelectorAll(elems);
}

function $id(elem) {
  return document.getElementById(elem);
}

function $cl(elem) {
  return document.getElementsByClassName(elem)[0];
}

function $$cl(elems) {
  return document.getElementsByClassName(elems);
}

function $t(elem) {
  return document.getElementsByTagName(elem)[0];
}

function $$t(elem) {
  return document.getElementsByTagName(elem);
}

function $add(tagName) {
  return document.createElement(tagName);
}

function swInit() {
  return new Promise((resolve) => {
    // Service worker
    if ("serviceWorker" in navigator && $('link[rel="manifest"]'))
      navigator.serviceWorker.register("/SchoolWork/TimeTable/sw.js");
    resolve();
  });
}

function installBtnInit() {
  return new Promise((resolve) => {
    const installBtn = $(".install.btn");

    // Get the prompt which usually shows up and save it
    window.addEventListener("beforeinstallprompt", (e) => {
      installPrompt = e;
      e.preventDefault();
      installBtn && (installBtn.style.display = "block");
    });

    // When the install button is clicked show the previously saved prompt
    installBtn &&
      installBtn.addEventListener("click", async (ev) => {
        if (installPrompt) {
          installPrompt.prompt();
          const { outcome } = await installPrompt.userChoice;

          if (outcome === "accepted") {
            // That means the user installed the website
            installPrompt = false; // So we dont need this button to work anymore
            ev.target.display = "none";
          }
        }
      });
    resolve();
  });
}

function navInit() {
  return new Promise((resolve) => {
    if ($("nav")) {
      const division = localStorage.getItem("division");

      if (
        division &&
        $id(division) &&
        $(".ind > div:last-child > label").innerText <= division
      )
        $id(division).checked = true;
      else $('input[name="div"]').checked = true;
    }
    resolve();
  });
}

function thirdLangInit() {
  return new Promise((resolve) => {
    if ($('[name="third-lang"].dropdown')) {
      const prefLang = localStorage.getItem("thirdLang");

      prefLang &&
        $$('[name="third-lang"].dropdown > option').forEach(
          (opt) => (opt.selected = opt.innerText.trim() === prefLang)
        );
    }

    Array.from($$cl("go-btn")) // Get all 3rd language buttons
      .forEach((goBtns) =>
        goBtns.addEventListener(
          "click", // For each button add a click event listener
          (ev) => {
            const goBtn = ev.target;

            // Set the clicked go button's link to
            // the value of the select element of the button
            goBtn.setAttribute("href", goBtn.previousElementSibling.value);

            // Set this as the default language now
            localStorage.setItem(
              "thirdLang",
              $(
                `option[value="${goBtn.previousElementSibling.value}"]`
              ).innerText.trim()
            );
          }
        )
      );
    resolve();
  });
}

function setDataTime(mobile = false) {
  return new Promise((resolve) => {
    const timings = $$(".resp-table#curr tr > th:not(:first-child)");
    const tds = $$(".resp-table#curr tr > td:not(:first-child)");

    if (
      tds.length &&
      (mobile || window.matchMedia("(max-width: 770px)").matches) &&
      !("time" in tds[0].dataset)
    )
      tds.forEach((td, i) =>
        td.setAttribute("data-time", timings[i % 2].innerText)
      );
    resolve();
  });
}

function setCancelled() {
  return new Promise((resolve) => {
    date = newDate();

    const tds = $$(".resp-table#curr tr > td:not(:first-child)");

    tds.forEach((td) => {
      if ("cancelled" in td.dataset) {
        const datesAsStr = td.dataset.cancelled;

        datesAsStr.split(", ").forEach((dateAsStr) => {
          const cancelledDateStrArr = dateAsStr.split("-");
          const cancelledDate = new Date(
            parseInt(cancelledDateStrArr[2]),
            parseInt(cancelledDateStrArr[1]),
            parseInt(cancelledDateStrArr[0]) + 6
          );
          if (cancelledDate >= date)
            td.firstElementChild.classList.add("greyed");
        });
      }
    });
    resolve();
  });
}

function setBorderThickness(
  setRange = true,
  thickness = defConfig.borderThickness,
  myConfig = config
) {
  $("html").style.setProperty("--border-thickness", `${thickness}px`);

  myConfig.borderThickness = thickness;
  saveConfig(myConfig);

  if (setRange) $id("border-thickness").value = thickness;
}

function setCardBlur(
  setRange = true,
  blur = defConfig.blur.cards,
  config = getConfig()
) {
  $("html").style.setProperty("--card-blur", `${blur}px`);

  config.blur || (config.blur = {});
  config.blur.cards = blur;
  saveConfig(config);

  if (setRange) $id("bg-blur-cards").value = blur;
}

function setNavBlur(
  setRange = true,
  blur = defConfig.blur.nav,
  config = getConfig()
) {
  $("nav").style.setProperty("backdrop-filter", `blur(${blur}px)`);

  config.blur || (config.blur = {});
  config.blur.nav = blur;
  saveConfig(config);

  if (setRange) $id("bg-blur-nav").value = blur;
}

function update() {
  return new Promise((resolve) => {
    date = newDate();

    setDataTime();
    setCancelled();

    if (date.getDay()) {
      // If today isn't Sunday
      removeExistingOl();

      const todaysRow = $$(
        `#curr tr:nth-child(${date.getDay() + 1}) > td:not(:first-child)`
      );
      const ol = document.createElement("ol");

      todaysRow.forEach(({ firstElementChild: btn }, i) => {
        if (btn)
          ol.appendChild(
            (() => {
              // Adds an li
              const li = linkCardLiTemplate.cloneNode(true);
              const timingAndStatus = li.firstElementChild;
              const timeDetails = timeInRange(
                addTime(
                  $(`#curr tr > th:nth-child(${i + 2})`).innerText,
                  timingAndStatus.firstElementChild
                ).innerText
              );

              statusLogic(timeDetails, timingAndStatus.children[1], btn);

              li.appendChild(btn.cloneNode(true));

              return li;
            })()
          );
      });

      $cl("link-card").appendChild(ol);
    }
    resolve();
  });
}

function radioChange(callUpdate = true) {
  return new Promise((resolve) => {
    Array.from($$(".ind input")).every(async (btn) => {
      if (btn.checked) {
        const currClass =
          $("h1").innerText.slice(0, $("h1").innerText.length - 1) +
          btn.nextElementSibling.innerText;
        localStorage.setItem("division", btn.id);

        $("h1").innerText = currClass;
        $id("curr").removeAttribute("id");
        $(`.${currClass.toLowerCase()}`).setAttribute("id", "curr");
        if (callUpdate) callUpdate && (await update());
        return false;
      }
      return true;
    });
    resolve();
  });
}

function removeExistingOl() {
  const ol = $(".link-card ol");
  ol && $cl("link-card").removeChild(ol);
}

function addTimingAndStatus(parent) {
  const timingAndStatus = document.createElement("div");

  timingAndStatus.classList.add("timing-and-status");
  parent.appendChild(timingAndStatus);

  return timingAndStatus;
}

function addTime(timeFrameText, whereTo) {
  whereTo.innerText = timeFrameText + ":";
  return whereTo;
}

function addStatus(parent) {
  const status = document.createElement("div");

  status.classList.add("status");
  parent.appendChild(status);

  return status;
}

function statusLogic(timeDetails, status, correspondingInp) {
  const updateActiveBtn = () => {
    activeBtnLogic(timeDetails, correspondingInp, false);
  };

  if (correspondingInp.classList.contains("greyed") && timeDetails !== false) {
    status.innerText = "Cancelled";
    status.classList.add("prob");
  } else if (timeDetails === true || timeDetails < 0) {
    status.innerText = "✓Join";
    status.classList.add("go");
    status.classList.remove("wait");
    updateActiveBtn();
  } else if (timeDetails > 0) {
    const secs = timeDetails % 60;

    status.innerText =
      Math.floor(timeDetails / 60) + ":" + (secs < 10 ? "0" : "") + secs;
    status.classList.add("wait");
    updateActiveBtn();

    return false;
  } else {
    status.innerText = "";
    status.classList.remove("prob");
    updateActiveBtn();
  }

  return true;
}

// Function for easy testing
function newDate() {
  const date = new Date();
  return date;
}

function timeInRange(strRange) {
  date = newDate();
  strRange = strRange.split(" ");
  strRange.splice(1, 1);

  const range = makeDateFromStr(strRange);
  const incMinsBy = (time, offset) =>
    time.setMinutes(time.getMinutes() + offset);

  incMinsBy(range[0], -5); // starts 5 mins early
  incMinsBy(range[1], 1); // ends a min late
  if (date >= range[0] && date <= range[1])
    // Add five minutes to the difference (300000ms = 5 mins) and then convert it to minutes
    return Math.round((range[0] - date + 300000) / 1000) || true;
  return false;
}

function makeDateFromStr(range) {
  const retTime = [];

  range.forEach((time) => {
    time = time.split(":");
    retTime.push(newDate());
    retTime[retTime.length - 1].setHours(time[0], time[1], 0, 0);
  });

  return retTime;
}

function activeBtnLogic(timeDetails, correspondingInp, greyed = true) {
  if (timeDetails) {
    // If the class is supposed to be cancelled, don't highlight it.
    if (!greyed || !correspondingInp.classList.contains("greyed"))
      correspondingInp.classList.add("active");
  } else {
    if (correspondingInp.classList.contains("active")) {
      const activeInTT = $("#curr .active");
      activeInTT && activeInTT.classList.remove("active");
    }

    correspondingInp.classList.remove("active");
  }
}

function statusUpdate() {
  Array.from($$cl("timing-and-status")).every((timingAndStatus) => {
    const timeDetails = timeInRange(
      timingAndStatus.firstElementChild.innerText
    );

    return statusLogic(
      timeDetails,
      timingAndStatus.querySelector(".status"),
      timingAndStatus.parentElement.lastElementChild
    );
  });
}

function setProp(propName, propContent) {
  html.style.setProperty(propName, propContent);
}

function setMainClr(
  setClrChooser = true,
  to = defConfig.mainClr,
  myConfig = config
) {
  setProp("--main-clr", to);
  myConfig.mainClr = to;
  setClrChooser && ($id("main-clr-chooser").value = rgbToHex(to));
}

function setCardBorderRad(
  setRange = true,
  rad = defConfig.borderRad.card,
  myConfig = config
) {
  setProp("--card-border-rad", `${rad}px`);

  myConfig.borderRad || (myConfig.borderRad = {});
  myConfig.borderRad.card = rad;

  setRange && ($id("border-radius-cards").value = rad);
}

function setBtnBorderRad(
  setRange = true,
  rad = defConfig.borderRad.btn,
  myConfig = config
) {
  setProp("--btn-border-rad", `${rad}px`);

  myConfig.borderRad.btn = rad;

  setRange && ($id("border-radius-btns").value = rad);
}

function setBgClr(
  setClrChooser = true,
  clr = defConfig.bgClr.clr,
  myConfig = config
) {
  setProp("--elem-bg-clr", clr);

  myConfig.bgClr.clr = clr;

  setClrChooser && ($id("bg-clr").value = rgbToHex(clr));
}

function setBgClrOpacity(
  setRange = true,
  opacity = defConfig.bgClr.opacity,
  myConfig = config
) {
  setProp("--opacity", opacity / 100);

  myConfig.bgClr.opacity = opacity;

  setRange && ($id("bg-clr-opacity").value = opacity);
}

function ensureFont(myConfig = config) {
  myConfig.font || (myConfig.font = {});
}

function setNormFont(
  setChooser = true,
  clr = defConfig.font.norm,
  myConfig = config
) {
  setProp("--norm-font-clr", clr);

  myConfig.font.norm = clr;

  setChooser && ($id("norm-font-clr").value = clr);
}

function setThemeFont(
  setChooser = true,
  clr = defConfig.font.theme,
  myConfig = config
) {
  setProp("--theme-font-clr", clr);

  myConfig.font.theme = clr;

  setChooser && ($id("theme-font-clr").value = clr);
}

function setBtnBgClr(
  setInps = true,
  clr = defConfig.bgClr.btn.clr,
  opacity = defConfig.bgClr.btn.opacity,
  myConfig = config
) {
  setProp("--btn-bg-clr", `rgba(${clr}, ${opacity / 100})`);

  myConfig.bgClr.btn || (myConfig.bgClr.btn = {});
  myConfig.bgClr.btn.clr = clr;
  myConfig.bgClr.btn.opacity = opacity;

  if (setInps) {
    $id("bg-clr-btn").value = rgbToHex(clr);
    $id("bg-clr-btn-opacity").value = opacity;
  }
}

function setBgImg(file, myConfig = config) {
  const reader = new FileReader();
  reader.onerror = () => {
    alert(
      `${reader.error} error occured while reading the uploaded background image.`
    );
  };

  reader.onload = () => {
    loadBg(false, reader.result, null, myConfig);

    myConfig.bgImg[1080] = reader.result;
    myConfig.bgImg.changed = true;
  };

  reader.readAsDataURL(file);
}

function loadBg(
  reset = true,
  bg1080 = defConfig.bgImg[1080],
  bg768 = defConfig.bgImg[768],
  myConfig = config
) {
  setProp("--bg-1080", `url(${bg1080})`);
  setProp("--bg-768", bg768 ? `url(${bg768})` : "var(--bg-1080)");

  reset && (myConfig.bgImg = defConfig.bgImg);
}

function hexToRGB(hex) {
  hex = hex.slice(1, hex.length); // Remove the #
  return `${parseInt(hex.slice(0, 2), 16)}, ${parseInt(
    hex.slice(2, 4),
    16
  )}, ${parseInt(hex.slice(4, hex.length), 16)}`;
}

function rgbToHex(rgbStr) {
  rgbStr = rgbStr
    .split(", ")
    .map((clr) => parseInt(clr).toString(16).padStart(2, "0"));

  rgbStr.unshift("#");

  return rgbStr.join("");
}

function getConfig() {
  return JSON.parse(localStorage.getItem("config")) || saveConfig();
}

function saveConfig(config = defConfig) {
  localStorage.setItem("config", JSON.stringify(config));
  return config;
}

function resetAll() {
  config = defConfig;
  window.location.reload();
}

// This is used by redirect.html
localStorage.setItem("lastVisitedPage", window.location.pathname);

swInit();
installBtnInit();
navInit()
  .then(() => radioChange(false))
  .then(update);
thirdLangInit();

window
  .matchMedia("(max-width: 770px)")
  .addEventListener("change", () => setDataTime(true));

if (date.getDay())
  // If today isn't sunday
  setInterval(statusUpdate, 1 * 1000);

if ($cl("menu-content")) {
  for (val in defConfig) config[val] ?? (config[val] = defConfig[val]);

  setMainClr(true, config.mainClr || defConfig.mainClr, config);
  setCardBorderRad(
    true,
    config.borderRad.card || defConfig.borderRad.card,
    config
  );
  setBtnBorderRad(true, config.borderRad.btn, config);
  setBgClr(true, config.bgClr.clr, config);
  setBgClrOpacity(true, config.bgClr.opacity, config);
  setNormFont(true, config.font.norm, config);
  setThemeFont(true, config.font.theme, config);
  setBtnBgClr(true, config.bgClr.btn.clr, config.bgClr.btn.opacity, config);
  setBorderThickness(true, config.borderThickness, config);
  setCardBlur(true, config.blur.cards, config);
  setNavBlur(true, config.blur.nav, config);

  if (config.bgImg && config.bgImg.changed)
    loadBg(false, config.bgImg[1080], null, config);
}

function getConfDataURI() {
  saveConfig(config);
  return encodeURIComponent(localStorage.getItem("config"));
}

function getConfName() {
  return `TimetableConf${(date = newDate())}.json`;
}

const exportBtn = $id("export-btn");
exportBtn &&
  exportBtn.addEventListener("click", (e) => {
    const a = $add("a");
    a.setAttribute(
      "href",
      "data:application/json;charset=utf-8," + getConfDataURI()
    );
    a.setAttribute("download", getConfName());
    a.click();
  });

const importInp = $id("import-inp");
importInp &&
  importInp.addEventListener("input", (e) => {
    const reader = new FileReader();

    reader.onerror = () => {
      alert(`${reader.error} occured while importing config`);
    };

    reader.onload = () => {
      config = JSON.parse(reader.result);
      window.location.reload();
    };

    reader.readAsText(importInp.files[0]);
  });

window.onunload = () => {
  saveConfig(config);
};

const shareBtn = $id("share-btn");

if (shareBtn) {
  if ("canShare" in navigator) {
    $id("share-btn").addEventListener("click", () => {
      const file = new File([localStorage.getItem("config")], "config.txt", {
        type: "text/plain",
      });

      navigator
        .share({
          url: location.href,
          title: "My settings for Google Meet timetable",
          text: "This are my settings for the timetable. To use them share this file and select timetable in the prompt that comes up. You must have installed the timetable website as an app first",
          files: [file],
        })
        .catch((err) => alert(`${err} occured while sharing.`));
    });
  } else {
    shareBtn.classList.add("greyed");
    shareBtn.disabled = true;

    const statusText = $id("share-status-text");

    statusText.innerText = "Your browser doesn't support File Sharing";
    statusText.classList.add("prob");
  }
}