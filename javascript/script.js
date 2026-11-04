/* =========================================================
   Temani Adams Law — homepage behavior
   ========================================================= */

/* ---------- Forms ----------
   Concept build: the consultation form (hero) and the contact form
   validate their fields and show a thank-you state. Connect both to
   the live form handler when the site launches. */
(function () {
    "use strict";

    function setupForm(formId, errorId, successId, errorText) {
        var form = document.getElementById(formId);

        if (!form) {
            return;
        }

        var error = document.getElementById(errorId);
        var success = document.getElementById(successId);
        var fields = form.querySelectorAll("input, select, textarea");

        fields.forEach(function (field) {
            field.addEventListener("input", function () {
                if (field.checkValidity()) {
                    field.removeAttribute("aria-invalid");
                }
            });
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            var firstInvalid = null;

            fields.forEach(function (field) {
                var valid = field.checkValidity();
                field.setAttribute("aria-invalid", String(!valid));

                if (!valid && !firstInvalid) {
                    firstInvalid = field;
                }
            });

            if (firstInvalid) {
                error.textContent = errorText;
                firstInvalid.focus();
                return;
            }

            error.textContent = "";
            form.classList.add("is-sent");
            success.hidden = false;
            success.focus();
        });
    }

    setupForm("consult-form", "consult-error", "consult-success",
        "Please fill in your name, phone, a valid email, and the type of case.");
    setupForm("contact-form", "contact-error", "contact-success",
        "Please fill in your name, a valid email, a topic, and your message.");
})();

/* ---------- Practice areas slider ----------
   Arrows move one card at a time and autoplay loops through the
   cards. Autoplay stops on hover or focus, and stays off for
   visitors who prefer reduced motion. */
(function () {
    "use strict";

    var slider = document.querySelector(".services-slider");

    if (!slider) {
        return;
    }

    var track = slider.querySelector(".services-track");
    var pauseButton = slider.querySelector(".services-pause");
    var arrows = slider.querySelectorAll("[data-dir]");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var paused = reducedMotion;
    var held = false;
    var timer = null;
    var cards = track.querySelectorAll(".service-card");
    var countCurrent = slider.querySelector(".services-count-current");
    var countTotal = slider.querySelector(".services-count-total");
    var progressBar = slider.querySelector(".services-progress-bar");
    var total = cards.length;

    function pad(number) {
        return number < 10 ? "0" + number : String(number);
    }

    // Each card announces its place, e.g. "3 of 8"
    cards.forEach(function (card, index) {
        card.setAttribute("aria-roledescription", "slide");
        card.setAttribute("aria-label", (index + 1) + " of " + total);
    });

    countTotal.textContent = pad(total);

    function step() {
        var card = track.querySelector(".service-card");
        var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return card.getBoundingClientRect().width + gap;
    }

    function move(dir) {
        var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
        var atStart = track.scrollLeft <= 4;

        if (dir > 0 && atEnd) {
            track.scrollTo({ left: 0, behavior: "smooth" });
        } else if (dir < 0 && atStart) {
            track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
        } else {
            track.scrollBy({ left: dir * step(), behavior: "smooth" });
        }
    }

    function restart() {
        clearInterval(timer);

        if (!paused && !held) {
            timer = setInterval(function () {
                move(1);
            }, 5000);
        }
    }

    function setPaused(value) {
        paused = value;
        pauseButton.classList.toggle("is-paused", paused);
        pauseButton.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
        restart();
    }

    arrows.forEach(function (button) {
        button.addEventListener("click", function () {
            move(Number(button.getAttribute("data-dir")));
            restart();
        });
    });

    pauseButton.addEventListener("click", function () {
        setPaused(!paused);
    });

    track.addEventListener("mouseenter", function () {
        held = true;
        restart();
    });

    track.addEventListener("mouseleave", function () {
        held = false;
        restart();
    });

    track.addEventListener("focusin", function () {
        held = true;
        restart();
    });

    track.addEventListener("focusout", function (event) {
        if (!track.contains(event.relatedTarget)) {
            held = false;
            restart();
        }
    });

    // Nav links like #wrongful-death slide the matching card into view
    function showLinkedCard() {
        var card = location.hash ? track.querySelector(".service-card" + location.hash) : null;

        if (card) {
            var offset = card.getBoundingClientRect().left - track.getBoundingClientRect().left;
            var inset = parseFloat(getComputedStyle(track).paddingLeft) || 0;
            track.scrollTo({ left: track.scrollLeft + offset - inset, behavior: "smooth" });
            restart();
        }
    }

    // Counter shows the first card in view; the last card counts once
    // the row has reached its end
    var countFrame = null;

    function updateCount() {
        countFrame = null;
        var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
        var current = atEnd ? total : Math.min(total, Math.round(track.scrollLeft / step()) + 1);
        countCurrent.textContent = pad(current);
        progressBar.style.transform = "scaleX(" + current / total + ")";
    }

    track.addEventListener("scroll", function () {
        if (!countFrame) {
            countFrame = requestAnimationFrame(updateCount);
        }
    }, { passive: true });

    updateCount();

    window.addEventListener("hashchange", showLinkedCard);
    showLinkedCard();
    setPaused(paused);
})();
