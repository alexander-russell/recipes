function createTimer(name, seconds) {
    // Create main button
    const timer = document.createElement("button");
    timer.classList.add("timer");
    timer.setAttribute("name", name);

    // Create content wrapper
    const content = document.createElement("div");
    content.classList.add("timer-content");
    timer.appendChild(content);

    // Create title
    const title = document.createElement("div");
    title.classList.add("timer-name");
    title.textContent = name;
    content.appendChild(title);

    // Create seconds display
    const time = document.createElement("div");
    time.classList.add("timer-time");
    time.textContent = formatTime(seconds);
    content.appendChild(time);

    // Configure attributes
    timer.setAttribute("total", seconds);
    timer.setAttribute("started", getEpochSeconds());
    timer.setAttribute("remaining", seconds);

    // Add single click listener (start/stop)
    timer.addEventListener("click", () => {
        // Start timer
        if (!timer.classList.contains("active")) {
            timer.classList.add("active");
            // Log start time
            timer.setAttribute("started", getEpochSeconds());
        } 
        // Stop or reset timer
        else {
            // Reset the timer
            if (timer.classList.contains("elapsed")) {
                resetTimer(timer);
            } 
            // Stop timer
            else {
                timer.classList.remove("active");
                // Deduct runtime from remaining time, save it as attribute
                const runtime = getEpochSeconds() - timer.getAttribute("started");
                const remaining = 0 + timer.getAttribute("remaining") - runtime
                timer.setAttribute("remaining", remaining);
            }
        }
    });

    // Add double click listener (reset)
    timer.addEventListener("dblclick", () => {
        resetTimer(timer);
    });

    return timer;
}

function resetTimer(timer) {
    timer.querySelector(".timer-time").textContent = formatTime(timer.getAttribute("total"));
    timer.setAttribute("remaining", timer.getAttribute("total"));
    timer.classList.remove("active", "elapsed", "flashing");
}

function createClock() {
    //Create clock wrapper
    const wrapper = document.createElement("div");
    wrapper.classList.add("clock-wrapper");

    //Create clock element
    const clock = document.createElement("button");
    clock.classList.add("clock");
    clock.textContent = new Date().toTimeString().substring(0, 8);
    wrapper.appendChild(clock);

    //Add double click listener to hide timer wrapper
    const timersWrapper = document.querySelector(".timers-wrapper");
    timersWrapper.addEventListener("dblclick", () => {
        //Hide the clock's parent element
        timersWrapper.classList.add("hidden");

        //Add a clock icon to icons bar to bring it back
        const iconsListElement = document.querySelector(".icons-list")
        const icon = createIconClock();
        icon.classList.add("clickable");
        iconsListElement.appendChild(icon);

        // Configure click event for clock icon - bring back clock
        icon.addEventListener("click", (event) => {
            // Hide timers element entirely
            timersWrapper.classList.remove("hidden")
            icon.remove();
        });
    });

    return wrapper;
}

function manageTimers() {
    document.querySelectorAll(".timer.active").forEach((timer) => {
        // Calculate remaining time
        const runtime = getEpochSeconds() - timer.getAttribute("started");
        const remaining = 0 + timer.getAttribute("remaining") - runtime

        // If still time remaining, just update time
        if (remaining > 0) {
            // Set time
            timer.querySelector(".timer-time").textContent = formatTime(remaining);
        }
        // If elapsed, set class and count up instead of down
        else {
            // Set time
            timer.classList.add("elapsed");
            timer.querySelector(".timer-time").textContent = formatTime(-remaining);

            // Every odd second, toggle flashing class
            timer.classList.toggle("flashing");
        }
    });
}

function manageClock() {
    const clock = document.querySelector(".clock");
    clock.textContent = new Date().toTimeString().substring(0, 8);
}

function displayTimers(timerDetails) {
    list = document.querySelector(".timers");
    if (timerDetails.length > 0) {
        // Populate timer list
        for (const timerDetail of timerDetails) {
            list.appendChild(createTimer(timerDetail.Name, timerDetail.Seconds));
        }

        // Arrange a callback every second to update
        setInterval(manageTimers, 1000);
    } else {
        // Display a clock
        list.appendChild(createClock());

        // Arrange a callback every second to update
        setInterval(manageClock, 1000);
    }
}