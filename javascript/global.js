/* =========================================================
   Temani Adams Law — global behavior
   Header scroll state, mobile menu and dropdown menus.
   ========================================================= */

(function () {
    "use strict";

    var header = document.getElementById("site-header");
    var toggle = document.getElementById("menu-toggle");
    var menu = document.getElementById("site-menu");

    if (!header || !toggle || !menu) {
        return;
    }

    var desktopQuery = window.matchMedia("(min-width: 64rem)");
    var subToggles = menu.querySelectorAll(".nav-sub-toggle");

    function closeSubs(except) {
        subToggles.forEach(function (button) {
            if (button !== except) {
                button.setAttribute("aria-expanded", "false");
            }
        });
    }

    function setMenu(open) {
        header.classList.toggle("menu-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        document.body.classList.toggle("menu-locked", open);

        if (!open) {
            closeSubs();
        }
    }

    function isOpen() {
        return header.classList.contains("menu-open");
    }

    toggle.addEventListener("click", function () {
        setMenu(!isOpen());
    });

    // Dropdowns: accordions in the mobile menu, panels on desktop
    subToggles.forEach(function (button) {
        button.addEventListener("click", function () {
            var expanded = button.getAttribute("aria-expanded") === "true";
            closeSubs(button);
            button.setAttribute("aria-expanded", String(!expanded));
        });
    });

    // Close after choosing a link so the page can scroll to it
    menu.addEventListener("click", function (event) {
        if (!event.target.closest("a")) {
            return;
        }

        closeSubs();

        if (isOpen()) {
            setMenu(false);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") {
            return;
        }

        var openSub = menu.querySelector('.nav-sub-toggle[aria-expanded="true"]');

        if (openSub && desktopQuery.matches) {
            closeSubs();
            openSub.focus();
        } else if (isOpen()) {
            setMenu(false);
            toggle.focus();
        }
    });

    document.addEventListener("click", function (event) {
        if (!header.contains(event.target)) {
            closeSubs();

            if (isOpen()) {
                setMenu(false);
            }
        }
    });

    // Close a desktop dropdown once keyboard focus leaves it
    menu.addEventListener("focusout", function (event) {
        if (!desktopQuery.matches) {
            return;
        }

        var item = event.target.closest(".has-sub");

        if (item && !item.contains(event.relatedTarget)) {
            item.querySelector(".nav-sub-toggle").setAttribute("aria-expanded", "false");
        }
    });

    desktopQuery.addEventListener("change", function (event) {
        if (event.matches) {
            setMenu(false);
        }
    });

    // Darker, more solid header once the page scrolls
    function updateScrolled() {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
    }

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
})();

/* ---------- Brush underlines ----------
   Holds each underline back until its word scrolls into view,
   then lets the CSS transition draw it in. */
(function () {
    "use strict";

    var marks = document.querySelectorAll(".text-underline");

    if (!marks.length || !("IntersectionObserver" in window)) {
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.remove("is-waiting");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });

    marks.forEach(function (mark) {
        mark.classList.add("is-waiting");
        observer.observe(mark);
    });
})();
