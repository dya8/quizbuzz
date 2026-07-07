const { spawn } = require("child_process");

const path = require("path");
const pythonScript = path.join(__dirname, "../ocr/extract_text.py");



function runOCR(pdfPath) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, "../ocr/extract_text.py");

    console.log("Running OCR...");
    console.log("Python Script:", pythonScript);
    console.log("PDF:", pdfPath);

    const python = spawn("python", [pythonScript, pdfPath]);

    let output = "";
    let error = "";

    python.stdout.on("data", (data) => {
      output += data.toString("utf8");
    });

    python.stderr.on("data", (data) => {
      error += data.toString("utf8");
    });

    python.on("error", (err) => {
      reject(err);
    });

    python.on("close", (code) => {
      console.log("Python Exit Code:", code);

      if (code !== 0) {
        return reject(new Error(error));
      }

      resolve(output.trim());
    });
    python.on("exit", (code) => {
  console.log("Python exited with:", code);
});
  });
}

module.exports = runOCR;