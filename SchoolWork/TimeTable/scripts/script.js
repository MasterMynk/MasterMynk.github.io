let installPrompt;
let date = newDate();
const html = $t("html");

class Message {
  constructor(
    from = newDate().getDate(),
    to = newDate().getDate(),
    messages = "",
    classes = [""]
  ) {
    let fromDate = newDate();
    fromDate.setDate(from);
    fromDate.setHours(0, 0, 0, 0);

    let toDate = newDate();
    toDate.setDate(to);
    toDate.setHours(23, 59, 59);

    this.toShow = newDate() >= fromDate && newDate() <= toDate;
    this.messages = messages;
    this.classes = classes;
  }

  isApplicableTo(realClass) {
    return this.classes.includes(realClass);
  }
}

const messages = [
  // All class names should be in capitals. This is because they are checked with the heading of the class.
  new Message(
    2,
    8,
    [`The timetable is subject to change`],
    ["VIIIA", "VIIIB", "VIIIC", "VIIID", "7A", "7B", "7C", "7D"]
  ),
];

class LiveClass {
  constructor(
    from = newDate(),
    startTime = newDate(),
    endTime = newDate(),
    name = "",
    link = "#",
    classes = []
  ) {
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(from.getDate() + 6);

    if (
      newDate() >= from &&
      newDate() <= to &&
      classes.some((str) => $t("h1").innerText === str)
    )
      this.toShow = true;

    this.elem = $new("a");
    this.elem.href = link;
    this.elem.innerText = name;
    this.elem.classList.add("btn");

    this.startTime = startTime;
    const startMins = this.startTime.getMinutes();
    this.startTimeStr = `${this.startTime.getHours()}:${
      startMins < 10 ? 0 : ""
    }${startMins}`;

    this.endTime = endTime;
    const endMins = this.endTime.getMinutes();
    this.endTimeStr = `${this.endTime.getHours()}:${
      endMins < 10 ? 0 : ""
    }${this.endTime.getMinutes()}`;

    this.range = `${this.startTimeStr} - ${this.endTimeStr}`;
  }
}

const liveClasses = [
  // new LiveClass(
  //   new Date(2021, 9, 11),
  //   new Date(2021, 9, 13, 11, 45, 0, 0),
  //   new Date(2021, 9, 13, 12, 15, 0, 0),
  //   "Scouts/Guides",
  //   "https://meet.google.com/tqi-iwyf-pvx",
  //   ["XA", "XB", "XC"]
  // ),
];

const linkCardLiTemplate = (() => {
  const li = $new("li");
  const timingAndStatus = addTimingAndStatus(li);
  timingAndStatus.appendChild($new("div"));
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

function $new(tagName) {
  return document.createElement(tagName);
}

function swInit() {
  return new Promise((resolve) => {
    // Service worker
    if ("serviceWorker" in navigator && $('link[rel="manifest"]'))
      navigator.serviceWorker.register("/SchoolWork/TimeTable/scripts/sw.js");
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

function goBtnUpdate() {
  $$("#curr .go-btn, .link-card .go-btn").forEach((btn) =>
    btn.addEventListener("mousedown", () =>
      Array.from(btn.previousElementSibling.children).every((opt) => {
        if (opt.selected) {
          btn.href = opt.value;
          localStorage.setItem("thirdLang", opt.innerText.trim());
          return false;
        }
        return true;
      })
    )
  );
}

function thirdLangDefSet() {
  if ($('[name="third-lang"].dropdown')) {
    const prefLang = localStorage.getItem("thirdLang");

    prefLang &&
      $$(
        ':is(#curr, .link-card) [name="third-lang"].dropdown > option'
      ).forEach((opt) => (opt.selected = opt.innerText.trim() === prefLang));
  }
}

function setDataTime(mobile = false) {
  const timings = $$(".resp-table#curr tr > th:not(:first-child)");
  const tds = $$(".resp-table#curr tr > td:not(:first-child)");

  if (
    tds.length &&
    (mobile || window.matchMedia("(max-width: 900px)").matches) &&
    !("time" in tds[0].dataset)
  )
    tds.forEach((td, i) =>
      td.setAttribute("data-time", timings[i % timings.length].innerText)
    );
}

function update() {
  date = newDate();

  setDataTime();

  // If today isn't Sunday
  if (date.getDay()) {
    liveClasses.forEach((liveClass) => {
      if (liveClass.toShow) {
        Array.from($$("#curr tr > th:not(:first-child)")).every(
          (timing, ind, timings) => {
            let range = timing.innerText.split(" ");
            range.splice(1, 1);

            const startTime_date = timeStrToDate(range[0]);

            if (
              startTime_date.setDate(
                startTime_date.getDate() - (startTime_date.getDay() - 1)
              ) >
              new Date(liveClass.startTime).setDate(
                liveClass.startTime.getDate() -
                  (liveClass.startTime.getDay() - 1)
              )
            ) {
              // Reaching here meaning we have a class in the middle
              $$(`#curr tr > :is(td, th):nth-child(${ind + 2})`).forEach(
                (tableElem, ind) =>
                  tableElem.parentElement.insertBefore(
                    dynamicTdCreationLogic(tableElem, ind, liveClass),
                    tableElem
                  )
              );

              return false;
            }

            if (
              range[0] === liveClass.startTimeStr &&
              range[1] === liveClass.endTimeStr
            ) {
              // Reaching here meaning some class is gonna get replaced
              const td = $(
                `#curr tr:nth-child(${
                  liveClass.startTime.getDay() + 1
                }) > td:nth-child(${ind + 2})`
              );

              td.innerHTML = "";
              td.appendChild(liveClass.elem);
              return false;
            }

            if (ind === timings.length - 1) {
              // Reaching here means that this class is after all others
              $$(`#curr tr > :is(td, th):nth-child(${ind + 2})`).forEach(
                (tableElem, ind) =>
                  tableElem.parentElement.appendChild(
                    dynamicTdCreationLogic(tableElem, ind, liveClass)
                  )
              );
            }

            return true;
          }
        );
      }
    });

    const todaysRow = $$(
      `#curr tr:nth-child(${date.getDay() + 1}) > td:not(:first-child)`
    );

    const todaysBtns = $cl("todays-btns");
    todaysBtns.innerHTML = "";

    todaysRow.forEach(({ firstElementChild: btn }, i) => {
      if (btn)
        todaysBtns.appendChild(
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

            const appendBtn = btn.cloneNode(true);
            appendBtn.classList.add("todays");
            li.appendChild(appendBtn);

            return li;
          })()
        );
    });

    // linkCard.appendChild(todayBtns);
    goBtnUpdate();
    thirdLangDefSet();
  }

  {
    // Remove existing messageCard
    const messageCard = $(".message.card");
    messageCard && messageCard.parentElement.removeChild(messageCard);
  }

  messages.forEach((messageObj) => {
    if (
      messageObj.toShow &&
      (messageObj.classes.includes("All") ||
        messageObj.classes.includes($t(`h1`).innerText))
    ) {
      let messageCard = $(".message.card");
      if (!messageCard) {
        const cards = $cl("cards");
        messageCard = $new("li");

        messageCard.classList.add("card", "message");

        {
          // Adding the heading
          const heading = $new("h2");
          heading.innerText = "Messages:";
          messageCard.appendChild(heading);
        }
        // Adding an ol
        messageCard.appendChild($new("ol"));

        cards.insertBefore(messageCard, cards.children[0]);
      }

      // Actually adding the message in the card
      console.log(messageObj);
      messageObj.messages.forEach((message) => {
        const messageElem = $new("li");
        messageElem.innerHTML = message;
        messageCard.getElementsByTagName("ol")[0].appendChild(messageElem);
      });
    }
  });
}

function dynamicTdCreationLogic(refElem, ind, liveClass) {
  let elemToAdd = document.createElement("td");

  if (refElem.nodeName === "TH") {
    // If we're working with the timing
    elemToAdd = refElem.cloneNode(true);
    elemToAdd.innerText = liveClass.range;
  } else if (liveClass.startTime.getDay() === ind)
    elemToAdd.appendChild(liveClass.elem);

  return elemToAdd;
}

function radioChange(callUpdate = true) {
  Array.from($$(".ind input")).every(async (btn) => {
    if (btn.checked) {
      const currClass =
        $("h1").innerText.slice(0, $("h1").innerText.length - 1) +
        btn.nextElementSibling.innerText;
      localStorage.setItem("division", btn.id);

      $("h1").innerText = currClass;
      $id("curr").removeAttribute("id");
      $(`.${currClass.toLowerCase()}`).setAttribute("id", "curr");
      callUpdate && (await update());
      return false;
    }
    return true;
  });
}

function addTimingAndStatus(parent) {
  const timingAndStatus = $new("div");

  timingAndStatus.classList.add("timing-and-status");
  parent.appendChild(timingAndStatus);

  return timingAndStatus;
}

function addTime(timeFrameText, whereTo) {
  whereTo.innerText = timeFrameText + ":";
  return whereTo;
}

function addStatus(parent) {
  const status = $new("div");

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

  const range = makeDatesFromStrArr(strRange);
  const incMinsBy = (time, offset) =>
    time.setMinutes(time.getMinutes() + offset);

  incMinsBy(range[0], -5); // starts 5 mins early
  incMinsBy(range[1], 1); // ends a min late
  if (date >= range[0] && date <= range[1])
    // Add five minutes to the difference (300000ms = 5 mins) and then convert it to minutes
    return Math.round((range[0] - date + 300000) / 1000) || true;
  return false;
}

function timeStrToDate(str) {
  const retDate = newDate();
  const arr = str.split(":");

  retDate.setHours(arr[0], arr[1], 0, 0);

  return retDate;
}

function makeDatesFromStrArr(range) {
  const retTime = [];

  range.forEach((time) => retTime.push(timeStrToDate(time)));

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

function divRadioInit() {
  const divRadios = $$('[name="div"]');
  divRadios &&
    divRadios.forEach((divRadio) =>
      divRadio.addEventListener("change", radioChange)
    );
}

if (location.href.includes("#report-pop-up"))
  location.replace(location.pathname);
// This is used by redirect.html
localStorage.setItem("lastVisitedPage", location.pathname);

swInit();
installBtnInit();
navInit();
radioChange(false);
update();

window
  .matchMedia("(max-width: 770px)")
  .addEventListener("change", () => setDataTime(true));

// If today isn't sunday
if (date.getDay()) setInterval(statusUpdate, 1 * 1000);

divRadioInit();

$("#report-prompt.btn").onclick = () => {
  const reportList = $id("report-options");
  reportList.innerHTML = "";

  const reportCandidates = $$(".todays-btns > li > *:last-child");

  reportCandidates.forEach((candidate) => {
    function wrap(elem) {
      const label = $new("label");

      label.innerHTML = `<input type="checkbox">`;
      label.appendChild(elem);
      label.classList.add("report");

      return label;
    }

    const toAdd = candidate.cloneNode(true);

    if (toAdd.classList.contains("btn")) toAdd.href = "#report-pop-up";
    else
      Array.from(toAdd.getElementsByClassName("btn")).forEach(
        (btn) => (btn.href = "#report-pop-up")
      );

    if (toAdd.classList.contains("btn-list")) {
      Array.from(toAdd.getElementsByClassName("btn")).forEach((btn) =>
        reportList.appendChild(wrap(btn))
      );
      return;
    }

    if (toAdd.nodeName === "FORM")
      toAdd.getElementsByClassName("go-btn")[0].classList.remove("go-btn");

    reportList.appendChild(wrap(toAdd));
  });
};

$("#report.btn").onclick = () => {
  const selectedCheckboxes = $$(
    '#report-options input[type="checkbox"]:checked'
  );

  if (selectedCheckboxes.length) {
    open(
      `mailto:mayankshigaonker.2965@rosaryhighschool.org?subject=Here are the names of the subjects in ${
        $t("h1").innerText
      } whose link didn't work for me.&body=${Array.from(
        selectedCheckboxes
      ).reduce((str, checkbox, ind, arr) => {
        const workingElem = checkbox.nextElementSibling;
        let selectedName = "";

        if (workingElem.nodeName === "FORM") {
          const dropdown = workingElem.querySelector(".dropdown");
          selectedName =
            dropdown.children[dropdown.selectedIndex].innerText.trim();
        } else selectedName = workingElem.innerText.trim();

        let retStr = str + selectedName;

        if (ind === arr.length - 2) retStr += " and ";
        else if (ind < arr.length - 2) retStr += ", ";

        return retStr;
      }, "")} link${
        selectedCheckboxes.length > 1 ? "s aren't" : " isn't"
      } working`
    );
    $id("report-prob").style.display = "none";
  } else $id("report-prob").style.display = "unset";
};
