// ==========================================
// CUTOUT AI - COMPLETE FRONTEND
// AI BACKGROUND REMOVAL
// BEFORE / AFTER SLIDER
// BACKGROUND STUDIO
// FINAL PNG DOWNLOAD
// ==========================================


// ==========================================
// ELEMENTS
// ==========================================

const imageInput =
    document.getElementById("image");

const chooseBtn =
    document.getElementById("chooseBtn");

const dropZone =
    document.getElementById("dropZone");

const previewContainer =
    document.getElementById("previewContainer");

const previewImage =
    document.getElementById("previewImage");

const removeFile =
    document.getElementById("removeFile");

const processBtn =
    document.getElementById("processBtn");

const result =
    document.getElementById("result");

const uploadProgress =
    document.getElementById("uploadProgress");

const progressBar =
    document.querySelector(".progress-bar");


// ==========================================
// GLOBAL RESULT DATA
// ==========================================

let originalImageURL = null;
let removedImageURL = null;

let selectedBackground = "transparent";


// ==========================================
// SCROLL TO UPLOAD
// ==========================================

function scrollToUpload() {

    const uploadSection =
        document.getElementById("upload");

    if (uploadSection) {

        uploadSection.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// ==========================================
// CHOOSE IMAGE
// ==========================================

chooseBtn.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        imageInput.click();

    }
);


// ==========================================
// FILE SELECT
// ==========================================

imageInput.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files[0];

        if (file) {

            handleFile(file);

        }

    }
);


// ==========================================
// DRAG OVER
// ==========================================

dropZone.addEventListener(
    "dragover",
    (event) => {

        event.preventDefault();

        dropZone.classList.add(
            "dragging"
        );

    }
);


// ==========================================
// DRAG LEAVE
// ==========================================

dropZone.addEventListener(
    "dragleave",
    () => {

        dropZone.classList.remove(
            "dragging"
        );

    }
);


// ==========================================
// DROP IMAGE
// ==========================================

dropZone.addEventListener(
    "drop",
    (event) => {

        event.preventDefault();

        dropZone.classList.remove(
            "dragging"
        );


        const file =
            event.dataTransfer.files[0];


        if (file) {

            try {

                const dataTransfer =
                    new DataTransfer();

                dataTransfer.items.add(file);

                imageInput.files =
                    dataTransfer.files;

            } catch (error) {

                console.log(
                    "Could not assign dropped file."
                );

            }


            handleFile(file);

        }

    }
);


// ==========================================
// HANDLE FILE
// ==========================================

function handleFile(file) {

    if (!file.type.startsWith("image/")) {

        alert(
            "Please select a valid image."
        );

        return;

    }


    if (file.size > 5 * 1024 * 1024) {

        alert(
            "Image must be smaller than 5MB."
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload = (event) => {

        originalImageURL =
            event.target.result;


        previewImage.src =
            originalImageURL;


        previewContainer.style.display =
            "block";


        result.style.display =
            "none";


        uploadProgress.style.display =
            "none";


        if (progressBar) {

            progressBar.style.width =
                "0%";

        }

    };


    reader.onerror = () => {

        alert(
            "Unable to read this image."
        );

    };


    reader.readAsDataURL(file);

}


// ==========================================
// REMOVE SELECTED FILE
// ==========================================

removeFile.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();


        imageInput.value = "";

        previewImage.src = "";


        originalImageURL =
            null;

        removedImageURL =
            null;


        previewContainer.style.display =
            "none";


        result.style.display =
            "none";


        uploadProgress.style.display =
            "none";

    }
);


// ==========================================
// PROCESS IMAGE
// ==========================================

processBtn.addEventListener(
    "click",
    async () => {

        const file =
            imageInput.files[0];


        if (!file) {

            alert(
                "Please select an image first."
            );

            return;

        }


        // ==================================
        // FORM DATA
        // ==================================

        const formData =
            new FormData();


        formData.append(
            "image",
            file
        );


        // ==================================
        // BUTTON LOADING
        // ==================================

        processBtn.disabled =
            true;


        processBtn.innerHTML = `
            <span>✦</span>
            AI Processing...
        `;


        result.style.display =
            "block";


        result.innerHTML = `
            <div class="loader"></div>

            <p>
                AI is removing the background...
            </p>

            <small style="color:#77778a;">
                Please wait...
            </small>
        `;


        uploadProgress.style.display =
            "block";


        if (progressBar) {

            progressBar.style.width =
                "0%";

        }


        // ==================================
        // PROGRESS
        // ==================================

        let progress = 0;


        const progressTimer =
            setInterval(
                () => {

                    progress += 5;


                    if (progress >= 90) {

                        progress = 90;

                    }


                    if (progressBar) {

                        progressBar.style.width =
                            `${progress}%`;

                    }

                },
                200
            );


        try {

            // ==================================
            // SEND TO NODE.JS
            // ==================================

            console.log(
                "Sending image to server..."
            );


            const response =
                await fetch(
                    "/api/remove-background",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            // ==================================
            // SERVER RESPONSE
            // ==================================

            const data =
                await response.json();


            console.log(
                "Server response:",
                data
            );


            clearInterval(
                progressTimer
            );


            // ==================================
            // CHECK RESPONSE
            // ==================================

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Server error."
                );

            }


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Background removal failed."
                );

            }


            if (!data.imageUrl) {

                throw new Error(
                    "Server did not return image URL."
                );

            }


            // ==================================
            // SAVE RESULT URL
            // ==================================

            removedImageURL =
                data.imageUrl;


            if (progressBar) {

                progressBar.style.width =
                    "100%";

            }


            // ==================================
            // SHOW COMPLETE RESULT
            // ==================================

            showCompleteResult(
                data
            );


        } catch (error) {

            clearInterval(
                progressTimer
            );


            console.error(
                "Background removal error:",
                error
            );


            result.innerHTML = `

                <div class="error-result">

                    <div class="error-icon">
                        ×
                    </div>

                    <h3>
                        Something went wrong
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                </div>

            `;

        }


        // ==================================
        // RESET BUTTON
        // ==================================

        processBtn.disabled =
            false;


        processBtn.innerHTML = `
            <span>✦</span>
            Remove Background
            <span>→</span>
        `;

    }
);


// ==========================================
// SHOW COMPLETE RESULT
// ==========================================

function showCompleteResult(data) {

    result.innerHTML = `

        <div class="result-success">

            <div class="success-icon">
                ✓
            </div>

            <h3>
                Background Removed!
            </h3>

            <p>
                Your AI-generated transparent image is ready.
            </p>


            <!-- =================================
                 BEFORE / AFTER
            ================================== -->

            <div class="before-after-box"
                 id="beforeAfterBox">

                <img
                    src="${originalImageURL}"
                    class="before-image"
                    alt="Original Image"
                >

                <img
                    src="${data.imageUrl}"
                    class="after-image"
                    id="afterCompareImage"
                    alt="Background Removed Image"
                >


                <div
                    class="before-after-line"
                    id="compareLine"
                ></div>


                <div
                    class="before-after-handle"
                    id="compareHandle"
                >
                    ↔
                </div>


                <span
                    class="compare-label before-label"
                >
                    ORIGINAL
                </span>


                <span
                    class="compare-label after-label"
                >
                    AI RESULT
                </span>

            </div>


            <!-- =================================
                 SLIDER
            ================================== -->

            <input
                type="range"
                id="comparisonSlider"
                min="0"
                max="100"
                value="50"
                style="
                    width:100%;
                    max-width:650px;
                    margin:5px auto 25px;
                    display:block;
                    accent-color:#a855f7;
                    cursor:pointer;
                "
            >


            <!-- =================================
                 BACKGROUND STUDIO
            ================================== -->

            <div class="background-studio">

                <h3>
                    ✨ Background Studio
                </h3>

                <p>
                    Choose a background for your image
                </p>


                <div class="background-options">

                    <button
                        type="button"
                        class="background-option bg-transparent active"
                        data-bg="transparent"
                        title="Transparent"
                    ></button>


                    <button
                        type="button"
                        class="background-option bg-white"
                        data-bg="white"
                        title="White"
                    ></button>


                    <button
                        type="button"
                        class="background-option bg-black"
                        data-bg="black"
                        title="Black"
                    ></button>


                    <button
                        type="button"
                        class="background-option bg-purple"
                        data-bg="purple"
                        title="Purple Gradient"
                    ></button>


                    <button
                        type="button"
                        class="background-option bg-blue"
                        data-bg="blue"
                        title="Blue Gradient"
                    ></button>


                    <button
                        type="button"
                        class="background-option bg-sunset"
                        data-bg="sunset"
                        title="Sunset Gradient"
                    ></button>

                </div>


                <!-- =================================
                     FINAL PREVIEW
                ================================== -->

                <div
                    class="replacement-preview"
                    id="replacementPreview"
                >

                    <img
                        src="${data.imageUrl}"
                        id="replacementImage"
                        alt="Final Image"
                    >

                </div>


                <!-- =================================
                     DOWNLOAD
                ================================== -->

                <button
                    type="button"
                    class="final-download-btn"
                    id="finalDownloadBtn"
                >
                    ↓ Download Final PNG
                </button>

            </div>


            <!-- ORIGINAL AI DOWNLOAD -->

            <button
                type="button"
                class="download-btn"
                id="downloadBtn"
                style="margin-top:15px;"
            >
                ↓ Download Transparent PNG
            </button>

        </div>

    `;


    // ==========================================
    // INITIALIZE FEATURES
    // ==========================================

    setupComparisonSlider();

    setupBackgroundStudio(
        data.imageUrl
    );

    setupTransparentDownload(
        data.imageUrl
    );

}


// ==========================================
// BEFORE / AFTER SLIDER
// ==========================================

function setupComparisonSlider() {

    const slider =
        document.getElementById(
            "comparisonSlider"
        );

    const afterImage =
        document.getElementById(
            "afterCompareImage"
        );

    const line =
        document.getElementById(
            "compareLine"
        );

    const handle =
        document.getElementById(
            "compareHandle"
        );


    if (
        !slider ||
        !afterImage ||
        !line ||
        !handle
    ) {

        return;

    }


    function updateSlider() {

        const value =
            slider.value;


        // Show right portion
        // according to slider

        afterImage.style.clipPath =
            `inset(0 0 0 ${value}%)`;


        line.style.left =
            `${value}%`;


        handle.style.left =
            `${value}%`;

    }


    slider.addEventListener(
        "input",
        updateSlider
    );


    updateSlider();

}


// ==========================================
// BACKGROUND STUDIO
// ==========================================

function setupBackgroundStudio(
    imageURL
) {

    const options =
        document.querySelectorAll(
            ".background-option"
        );


    const preview =
        document.getElementById(
            "replacementPreview"
        );


    const image =
        document.getElementById(
            "replacementImage"
        );


    const downloadButton =
        document.getElementById(
            "finalDownloadBtn"
        );


    if (
        !options.length ||
        !preview ||
        !image
    ) {

        return;

    }


    // Initial background

    applyBackground(
        preview,
        "transparent"
    );


    // ==================================
    // OPTIONS
    // ==================================

    options.forEach(
        (option) => {

            option.addEventListener(
                "click",
                () => {

                    const bg =
                        option.dataset.bg;


                    selectedBackground =
                        bg;


                    // Remove active

                    options.forEach(
                        (item) => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    // Add active

                    option.classList.add(
                        "active"
                    );


                    // Apply

                    applyBackground(
                        preview,
                        bg
                    );

                }
            );

        }
    );


    // ==================================
    // FINAL DOWNLOAD
    // ==================================

    downloadButton.addEventListener(
        "click",
        async () => {

            await downloadFinalImage(
                imageURL,
                selectedBackground,
                downloadButton
            );

        }
    );

}


// ==========================================
// APPLY BACKGROUND
// ==========================================

function applyBackground(
    element,
    type
) {

    // Reset

    element.style.backgroundImage =
        "none";


    element.style.backgroundColor =
        "transparent";


    // ==================================
    // TRANSPARENT
    // ==================================

    if (type === "transparent") {

        element.classList.add(
            "bg-transparent"
        );

        return;

    }


    element.classList.remove(
        "bg-transparent"
    );


    // ==================================
    // WHITE
    // ==================================

    if (type === "white") {

        element.style.background =
            "#ffffff";

        return;

    }


    // ==================================
    // BLACK
    // ==================================

    if (type === "black") {

        element.style.background =
            "#111111";

        return;

    }


    // ==================================
    // PURPLE
    // ==================================

    if (type === "purple") {

        element.style.background =
            "linear-gradient(135deg,#7c3aed,#ec4899)";

        return;

    }


    // ==================================
    // BLUE
    // ==================================

    if (type === "blue") {

        element.style.background =
            "linear-gradient(135deg,#2563eb,#06b6d4)";

        return;

    }


    // ==================================
    // SUNSET
    // ==================================

    if (type === "sunset") {

        element.style.background =
            "linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)";

        return;

    }

}


// ==========================================
// DOWNLOAD TRANSPARENT PNG
// ==========================================

function setupTransparentDownload(
    imageURL
) {

    const button =
        document.getElementById(
            "downloadBtn"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        async () => {

            try {

                button.disabled =
                    true;


                button.innerHTML =
                    "Downloading...";


                const response =
                    await fetch(
                        imageURL
                    );


                if (!response.ok) {

                    throw new Error(
                        "Image download failed."
                    );

                }


                const blob =
                    await response.blob();


                const blobURL =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    blobURL;


                link.download =
                    "cutout-ai-transparent.png";


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                URL.revokeObjectURL(
                    blobURL
                );


                button.innerHTML =
                    "✓ Downloaded";


            } catch (error) {

                console.error(
                    "Transparent download error:",
                    error
                );


                alert(
                    "Unable to download the image."
                );


                button.innerHTML =
                    "↓ Download Transparent PNG";

            }


            setTimeout(
                () => {

                    button.disabled =
                        false;

                    button.innerHTML =
                        "↓ Download Transparent PNG";

                },
                1800
            );

        }
    );

}


// ==========================================
// DOWNLOAD FINAL IMAGE WITH BACKGROUND
// ==========================================

async function downloadFinalImage(
    imageURL,
    backgroundType,
    button
) {

    try {

        button.disabled =
            true;


        button.innerHTML =
            "Preparing PNG...";


        // ==================================
        // LOAD AI IMAGE
        // ==================================

        const image =
            await loadImage(
                imageURL
            );


        // ==================================
        // CREATE CANVAS
        // ==================================

        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            image.naturalWidth;


        canvas.height =
            image.naturalHeight;


        const ctx =
            canvas.getContext(
                "2d"
            );


        // ==================================
        // BACKGROUND
        // ==================================

        drawBackground(
            ctx,
            canvas.width,
            canvas.height,
            backgroundType
        );


        // ==================================
        // DRAW AI IMAGE
        // ==================================

        ctx.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
        );


        // ==================================
        // CONVERT TO PNG
        // ==================================

        canvas.toBlob(
            (blob) => {

                if (!blob) {

                    throw new Error(
                        "Could not create PNG."
                    );

                }


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    url;


                link.download =
                    "cutout-ai-final.png";


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                URL.revokeObjectURL(
                    url
                );


                button.innerHTML =
                    "✓ Final PNG Downloaded";


                setTimeout(
                    () => {

                        button.disabled =
                            false;

                        button.innerHTML =
                            "↓ Download Final PNG";

                    },
                    2000
                );

            },
            "image/png"
        );


    } catch (error) {

        console.error(
            "Final image error:",
            error
        );


        alert(
            "Unable to create final image. Please try again."
        );


        button.disabled =
            false;


        button.innerHTML =
            "↓ Download Final PNG";

    }

}


// ==========================================
// DRAW BACKGROUND ON CANVAS
// ==========================================

function drawBackground(
    ctx,
    width,
    height,
    type
) {

    // ==================================
    // TRANSPARENT
    // ==================================

    if (type === "transparent") {

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        return;

    }


    // ==================================
    // WHITE
    // ==================================

    if (type === "white") {

        ctx.fillStyle =
            "#ffffff";

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

        return;

    }


    // ==================================
    // BLACK
    // ==================================

    if (type === "black") {

        ctx.fillStyle =
            "#111111";

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

        return;

    }


    // ==================================
    // PURPLE GRADIENT
    // ==================================

    if (type === "purple") {

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                width,
                height
            );


        gradient.addColorStop(
            0,
            "#7c3aed"
        );


        gradient.addColorStop(
            1,
            "#ec4899"
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            0,
            0,
            width,
            height
        );


        return;

    }


    // ==================================
    // BLUE GRADIENT
    // ==================================

    if (type === "blue") {

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                width,
                height
            );


        gradient.addColorStop(
            0,
            "#2563eb"
        );


        gradient.addColorStop(
            1,
            "#06b6d4"
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            0,
            0,
            width,
            height
        );


        return;

    }


    // ==================================
    // SUNSET GRADIENT
    // ==================================

    if (type === "sunset") {

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                width,
                height
            );


        gradient.addColorStop(
            0,
            "#f97316"
        );


        gradient.addColorStop(
            0.5,
            "#ec4899"
        );


        gradient.addColorStop(
            1,
            "#8b5cf6"
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            0,
            0,
            width,
            height
        );


        return;

    }

}


// ==========================================
// LOAD IMAGE
// ==========================================

function loadImage(url) {

    return new Promise(
        (resolve, reject) => {

            const image =
                new Image();


            image.onload =
                () => {

                    resolve(
                        image
                    );

                };


            image.onerror =
                () => {

                    reject(
                        new Error(
                            "Unable to load processed image."
                        )
                    );

                };


            image.src =
                url;

        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}