let installPrompt;
let date = newDate();

const linkCardLiTemplate = (() => {
  const li = document.createElement("li");
  const timingAndStatus = addTimingAndStatus(li);
  timingAndStatus.appendChild(document.createElement("div"));
  addStatus(timingAndStatus);

  return li;
})();

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
};

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

(function main() {
  // This is used by redirect.html
  localStorage.setItem("lastVisitedPage", window.location.pathname);

  const config = getConfig();

  if ($cl("menu-content")) {
    setMainClr(true, config.mainClr || defConfig.mainClr, config);
    setCardBorderRad(
      true,
      config?.borderRad?.card || defConfig.borderRad.card,
      config
    );
    setBtnBorderRad(
      true,
      config?.borderRad?.btn || defConfig.borderRad.btn,
      config
    );
    setBgClr(
      true,
      config?.bgClr?.clr || defConfig.bgClr.clr,
      config?.bgClr?.opacity || defConfig.bgClr.opacity,
      config
    );
    setNormFont(true, config?.font?.norm || defConfig.font.norm, config);
    setThemeFont(true, config?.font?.theme || defConfig.font.theme, config);
    setBtnBgClr(
      true,
      config?.bgClr?.btn?.clr || defConfig.bgClr.btn.clr,
      config?.bgClr?.btn?.opacity || defConfig.bgClr.btn.opacity,
      config
    );
    setBorderThickness(
      true,
      config?.borderThickness || defConfig.borderThickness,
      config
    );
  }

  swInit();
  installBtnInit();
  navInit();
  thirdLangInit();

  radioChange(false);
  update();

  window
    .matchMedia("(max-width: 770px)")
    .addEventListener("change", () => setDataTime(true));

  if (date.getDay())
    // If today isn't sunday
    setInterval(statusUpdate, 1 * 1000);

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
})();

function swInit() {
  // Service worker
  if ("serviceWorker" in navigator && $('link[rel="manifest"]'))
    navigator.serviceWorker.register("/SchoolWork/TimeTable/sw.js");
}

function installBtnInit() {
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
          installPrompt = null; // So we dont need this button to work anymore
          ev.target.display = "none";
        }
      }
    });
}

function navInit() {
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
}

function thirdLangInit() {
  if ($('[name="third-lang"].dropdown')) {
    const prefLang = localStorage.getItem("thirdLang");

    prefLang &&
      $$('[name="third-lang"].dropdown > option').forEach(
        (opt) => (opt.selected = opt.innerText.trim() === prefLang)
      );
  }
}

function setDataTime(mobile = false) {
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
}

function setCancelled() {
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
        if (cancelledDate >= date) td.firstElementChild.classList.add("greyed");
      });
    }
  });
}

function setBorderThickness(
  setRange = true,
  thickness = defConfig.borderThickness,
  config = getConfig()
) {
  $("html").style.setProperty("--border-thickness", `${thickness}px`);

  config.borderThickness = thickness;
  saveConfig(config);

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
}

function radioChange(callUpdate = true) {
  Array.from($$(".ind input")).every((btn) => {
    if (btn.checked) {
      const currClass =
        $("h1").innerText.slice(0, $("h1").innerText.length - 1) +
        btn.nextElementSibling.innerText;
      localStorage.setItem("division", btn.id);

      $("h1").innerText = currClass;
      $id("curr").removeAttribute("id");
      $(`.${currClass.toLowerCase()}`).setAttribute("id", "curr");
      callUpdate && update();
      return false;
    }
    return true;
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

function setMainClr(
  setClrChooser = true,
  to = defConfig.mainClr,
  config = getConfig()
) {
  const mainClr = typeof to == "string" ? to : `${to.r}, ${to.g}, ${to.b}`;

  $("html").style.setProperty("--main-clr", mainClr);

  config.mainClr = mainClr;
  saveConfig(config);

  setClrChooser && ($id("main-clr-chooser").value = rgbToHex(mainClr));
}

function setCardBorderRad(
  setRange = true,
  rad = defConfig.borderRad.card,
  config = getConfig()
) {
  Array.from($$cl("card")).forEach((card) =>
    card.style.setProperty("border-radius", rad + "px")
  );

  config.borderRad || (config.borderRad = {});
  config.borderRad.card = rad;
  saveConfig(config);

  setRange && ($id("border-radius-cards").value = rad);
}

function setBtnBorderRad(
  setRange = true,
  rad = defConfig.borderRad.btn,
  config = getConfig()
) {
  $$(".btn,.dropdown").forEach((btn) =>
    btn.style.setProperty("border-radius", rad + "px")
  );

  config.borderRad || (config.borderRad = {});
  config.borderRad.btn = rad;
  saveConfig(config);

  setRange && ($id("border-radius-btns").value = rad);
}

function setBgClr(
  setInps = true,
  clr = defConfig.bgClr.clr,
  opacity = defConfig.bgClr.opacity,
  config = getConfig()
) {
  const bgClr = typeof clr == "string" ? clr : `${clr.r}, ${clr.g}, ${clr.b}`;
  const html = $("html");

  html.style.setProperty("--elem-bg-clr", bgClr);
  html.style.setProperty("--opacity", opacity / 100);

  config.bgClr || (config.bgClr = {});
  config.bgClr.clr = bgClr;
  config.bgClr.opacity = opacity;
  saveConfig(config);

  if (setInps) {
    $id("bg-clr").value = rgbToHex(bgClr);
    $id("bg-clr-opacity").value = opacity;
  }
}

function setNormFont(
  setChooser = true,
  clr = defConfig.font.norm,
  config = getConfig()
) {
  $("html").style.setProperty("--norm-font-clr", clr);

  config.font || (config.font = {});
  config.font.norm = clr;
  saveConfig(config);

  setChooser && ($id("norm-font-clr").value = clr);
}

function setThemeFont(
  setChooser = true,
  clr = defConfig.font.theme,
  config = getConfig()
) {
  $("html").style.setProperty("--theme-font-clr", clr);

  config.font || (config.font = {});
  config.font.theme = clr;
  saveConfig(config);

  setChooser && ($id("theme-font-clr").value = clr);
}

function setBtnBgClr(
  setInps = true,
  clr = defConfig.bgClr.btn.clr,
  opacity = defConfig.bgClr.btn.opacity,
  config = getConfig()
) {
  const bgClr = typeof clr == "string" ? clr : `${clr.r}, ${clr.g}, ${clr.b}`;
  const forCSS = `rgba(${bgClr}, ${opacity / 100})`;

  $$(".btn,.dropdown").forEach((btn) =>
    btn.style.setProperty("background-color", forCSS)
  );

  config.bgClr || (config.bgClr = {});
  config.bgClr.btn || (config.bgClr.btn = {});
  config.bgClr.btn.clr = bgClr;
  config.bgClr.btn.opacity = opacity;
  saveConfig(config);

  if (setInps) {
    $id("bg-clr-btn").value = rgbToHex(bgClr);
    $id("bg-clr-btn-opacity").value = opacity;
  }
}

function hexToRGB(hex) {
  hex = hex.slice(1, hex.length);
  color = {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, hex.length), 16),
  };

  return color;
}

function rgbToHex(rgbStr) {
  rgbStr = rgbStr
    .split(", ")
    .map((clr) => parseInt(clr).toString(16).padStart(2, "0"));

  rgbStr.unshift("#");

  return rgbStr.join("");
}

function getConfig() {
  return (
    JSON.parse(localStorage.getItem("config")) ||
    (() => {
      const config = defConfig;

      saveConfig(config);

      return config;
    })()
  );
}

function saveConfig(config) {
  localStorage.setItem("config", JSON.stringify(config));
}

function resetAll() {
  setMainClr();
  setCardBorderRad();
  setBtnBorderRad();
  setBgClr();
  setNormFont();
  setThemeFont();
  setBtnBgClr();
}
