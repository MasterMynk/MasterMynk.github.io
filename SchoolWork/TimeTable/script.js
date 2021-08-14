let installPrompt;
let date = new Date();

function $(elem) { return document.querySelector(elem); }
function $$(elems) { return document.querySelectorAll(elems); }

(function main() {
  // This is used by redirect.html
  localStorage.setItem("lastVisitedPage", window.location.pathname);

  swInit();
  installBtnInit();
  navInit();
  thirdLangInit();

  update();
  radioChange();

  window.matchMedia("(max-width: 770px)").addEventListener("change", () => setDataTime(true));

  // Every 30 seconds update the links
  setInterval(update, 30 * 1000);

  $$(".go-btn") // Get all 3rd language buttons
    .forEach(goBtns => goBtns.addEventListener("click", // For each button add a click event listener
      ev => {
        const goBtn = ev.target;

        // Set the clicked go button's link to
        // the value of the select element of the button
        goBtn.setAttribute("href",
          goBtn.previousElementSibling.value);

        // Set this as the default language now
        localStorage.setItem("thirdLang", $(`option[value="${goBtn.previousElementSibling.value}"]`).innerText.trim())
      }));
})();

function swInit() {
  // Service worker
  if ("serviceWorker" in navigator && $('link[rel="manifest"]'))
    navigator.serviceWorker.register("/SchoolWork/TimeTable/sw.js");
}

function installBtnInit() {
  // Get the prompt which usually shows up and save it
  window.addEventListener("beforeinstallprompt", e => {
    installPrompt = e;
    e.preventDefault();
    $(".install.btn") && ($(".install.btn").style.display = "block");
  });

  // When the install button is clicked show the previously saved prompt
  $(".install.btn") && $(".install.btn").addEventListener("click", async ev => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === "accepted") { // That means the user installed the website
        installPrompt = null; // So we dont need this button to work anymore
        ev.target.display = "none";
      }
    }
  });
}

function navInit() {
  if ($("nav")) {
    const division = localStorage.getItem("division");

    if (division && $(`#${division}`) && $(".ind > div:last-child > label").innerText <= division)
      $(`#${division}`).checked = true;
    else
      $('input[name="div"]').checked = true;
  }
}

function thirdLangInit() {
  if ($('[name="third-lang"].dropdown')) {
    const prefLang = localStorage.getItem("thirdLang");

    prefLang && $$('[name="third-lang"].dropdown > option').forEach(opt =>
      opt.selected = opt.innerText.trim() === prefLang
    );
  }
}

function setDataTime(mobile = false) {
  const timings = $$(".resp-table#curr tr > th:not(:first-child)");
  const tds = $$(".resp-table#curr tr > td:not(:first-child)");

  if ((mobile || window.matchMedia("(max-width: 770px)").matches) && !("time" in tds[0].dataset))
    tds.forEach((td, i) =>
      td.setAttribute("data-time", timings[i % 2].innerText)
    );
}

function setCancelled() {
  date = new Date();
  const tds = $$(".resp-table#curr tr > td:not(:first-child)");

  tds.forEach(td => {
    if ("cancelled" in td.dataset) {
      const datesAsStr = td.dataset.cancelled;

      datesAsStr.split(", ").forEach(dateAsStr => {
        const cancelledDateStrArr = dateAsStr.split("-");
        const cancelledDate = new Date(parseInt(cancelledDateStrArr[2]), parseInt(cancelledDateStrArr[1]), parseInt(cancelledDateStrArr[0]) + 6);
        if (cancelledDate >= date)
          td.firstElementChild.classList.add("greyed");
      });
    }
  })
}

function update() {
  const date = new Date();
  if (date.getDay()) { // If today isn't Sunday
    const todaysClassesOl = document.createElement("ol");

    const timeInRange = strRange => {
      const makeDate = range => {
        const retTime = [];
        range.forEach(time => {
          time = time.split(":");
          retTime.push(new Date());
          retTime[retTime.length - 1].setHours(time[0], time[1], 0, 0);
        });

        return retTime;
      };
      strRange = strRange.split(' ');
      strRange.splice(1, 1);

      const range = makeDate(strRange);
      const incMinsBy = (time, offset) => time.setMinutes(time.getMinutes() + offset);

      incMinsBy(range[0], -5); // starts 5 mins early
      incMinsBy(range[1], 1); // ends a min late
      if (date >= range[0] && date <= range[1])
        // Add five minutes to the difference (300000ms = 5 mins) and then convert it to minutes
        return Math.round(((range[0] - date) + 300000) / 60000) || true;
      return false;
    };

    { // Checkes if the ol exits and removes it if it does
      const ol = $(".link-card ol");
      if (ol)
        $(".link-card").removeChild(ol);
    }

    const todaysRow = $$(`#curr tr:nth-child(${date.getDay() + 1}) > td:not(:first-child)`);

    todaysRow.forEach((classElem, i) => {
      if (classElem.firstElementChild)
        todaysClassesOl.appendChild((() => { // Adds an li
          const li = document.createElement("li");

          // Adding the text div
          li.appendChild(document.createElement("div"));
          li.firstElementChild.classList.add("timing-and-status");

          const timings = $(`#curr tr:first-child > th:nth-child(${i + 2})`);

          { // Adding the timing container
            const timingContainer = document.createElement("div");

            timingContainer.innerText = timings.innerText + ":";
            li.firstElementChild.appendChild(timingContainer);
          }

          // Adding the button
          const timeDetails = timeInRange(timings.innerText);
          if (timeDetails) {
            // If the class is supposed to be cancelled, don't highlight it.
            if (!classElem.querySelector(".greyed"))
              classElem.firstElementChild.classList.add("active");

            // Adding the status
            const status = document.createElement("div");
            if (timeDetails === true || timeDetails < 0 || classElem.querySelector(".greyed")) {
              if (classElem.querySelector(".greyed")) {
                status.innerText = "Cancelled";
                status.classList.add("not-ok");
              }
              else {
                status.innerText = "✓Join";
                status.classList.add("ok");
              }
            } else {
              status.innerText = timeDetails +
                (timeDetails === 1 ? " min" : " mins");
              status.classList.add("ok");
            }

            status.classList.add("status");
            li.firstElementChild.appendChild(status);
          } else
            classElem.firstElementChild.classList.remove("active");

          classElem.firstElementChild.classList.remove("tt-btn");

          li.appendChild(classElem.firstElementChild.cloneNode(true));

          return li;
        })());
    });

    $(".link-card").appendChild(todaysClassesOl);
  }
}

function radioChange() {
  Array.from($$(".ind input")).every(btn => {
    if (btn.checked) {
      const currClass = $("h1").innerText.slice(0, $("h1").innerText.length - 1) + btn.nextElementSibling.innerText;
      localStorage.setItem("division", btn.id);

      $("h1").innerText = currClass;
      $("#curr").removeAttribute("id");
      $(`.${currClass.toLowerCase()}`).setAttribute("id", "curr");
      update();
      setDataTime();
      setCancelled();
      return false;
    }
    return true;
  });
}