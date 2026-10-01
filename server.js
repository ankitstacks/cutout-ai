const express = require("express");
const path = require("path");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

require("dotenv").config();

const app = express();
const PORT = 3000;

// ======================================
// DIRECTORIES
// ======================================

const uploadsDir = path.join(__dirname, "uploads");
const outputsDir = path.join(__dirname, "outputs");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(outputsDir)) {
    fs.mkdirSync(outputsDir, { recursive: true });
}


// ======================================
// FRONTEND
// ======================================

app.use(express.static(path.join(__dirname, "public")));


// ======================================
// SERVE OUTPUT IMAGES
// ======================================

app.use(
    "/outputs",
    express.static(outputsDir)
);


// ======================================
// MULTER
// ======================================

const upload = multer({
    dest: uploadsDir
});


// ======================================
// BACKGROUND REMOVAL
// ======================================

app.post(
    "/api/remove-background",
    upload.single("image"),
    async (req, res) => {

        console.log("\n==============================");
        console.log("BACKGROUND REMOVAL REQUEST");
        console.log("==============================");


        // Check image

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "No image was uploaded."
            });

        }


        const inputPath = req.file.path;

        console.log(
            "Uploaded:",
            req.file.originalname
        );


        try {

            // ==================================
            // CHECK API KEY
            // ==================================

            if (!process.env.REMOVE_BG_API_KEY) {

                throw new Error(
                    "REMOVE_BG_API_KEY is missing from .env"
                );

            }


            // ==================================
            // CREATE FORM DATA
            // ==================================

            const formData = new FormData();

            formData.append(
                "image_file",
                fs.createReadStream(inputPath)
            );

            formData.append(
                "size",
                "auto"
            );


            // ==================================
            // SEND TO REMOVE.BG
            // ==================================

            console.log(
                "Sending image to remove.bg..."
            );


            const response = await axios.post(
                "https://api.remove.bg/v1.0/removebg",
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        "X-Api-Key":
                            process.env.REMOVE_BG_API_KEY
                    },

                    responseType: "arraybuffer",

                    timeout: 120000
                }
            );


            console.log(
                "AI processing successful."
            );


            // ==================================
            // CREATE OUTPUT FILE
            // ==================================

            const fileName =
                `removed-${Date.now()}.png`;


            const outputPath =
                path.join(
                    outputsDir,
                    fileName
                );


            fs.writeFileSync(
                outputPath,
                response.data
            );


            console.log(
                "Output saved:",
                outputPath
            );


            // ==================================
            // DELETE ORIGINAL UPLOAD
            // ==================================

            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
            }


            // ==================================
            // RETURN DATA TO FRONTEND
            // ==================================

            const imageUrl =
                `/outputs/${fileName}`;


            const downloadUrl =
                `/api/download/${fileName}`;


            console.log(
                "Image URL:",
                imageUrl
            );

            console.log(
                "Download URL:",
                downloadUrl
            );


            return res.status(200).json({

                success: true,

                message:
                    "Background removed successfully!",

                fileName: fileName,

                imageUrl: imageUrl,

                downloadUrl: downloadUrl

            });


        } catch (error) {

            console.error(
                "\nBACKGROUND REMOVAL ERROR:"
            );


            if (error.response) {

                console.error(
                    "Status:",
                    error.response.status
                );

                console.error(
                    "Response:",
                    Buffer.from(
                        error.response.data
                    ).toString()
                );

            } else {

                console.error(
                    error.message
                );

            }


            // Delete uploaded file

            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
            }


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Background removal failed."

            });

        }

    }
);


// ======================================
// DOWNLOAD RESULT
// ======================================

app.get(
    "/api/download/:fileName",
    (req, res) => {

        const fileName =
            path.basename(
                req.params.fileName
            );


        const filePath =
            path.join(
                outputsDir,
                fileName
            );


        console.log(
            "Download request:",
            fileName
        );


        if (!fs.existsSync(filePath)) {

            return res.status(404).send(
                "File not found."
            );

        }


        res.download(
            filePath,
            "cutout-ai-result.png"
        );

    }
);


// ======================================
// TEST API
// ======================================

app.get(
    "/api/test",
    (req, res) => {

        res.json({

            success: true,

            message:
                "CutoutAI server is working!"

        });

    }
);


// ======================================
// START SERVER
// ======================================

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "================================="
        );
        console.log(
            "🚀 CutoutAI Server Started"
        );
        console.log(
            `🌐 http://localhost:${PORT}`
        );
        console.log(
            "================================="
        );
        console.log("");

    }
);