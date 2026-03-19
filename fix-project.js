const fs = require("fs");
const path = require("path");

function fixFiles(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);

        if (stat.isDirectory()) {
            fixFiles(full);
        }

        if (file === "package.json") {
            let data = JSON.parse(fs.readFileSync(full, "utf8"));

            if (data.scripts && data.scripts.preinstall) {
                delete data.scripts.preinstall;
            }

            fs.writeFileSync(full, JSON.stringify(data, null, 2));
        }

        if (file === "vite.config.ts") {
            let text = fs.readFileSync(full, "utf8");

            text = text.replace(
                'throw new Error("PORT environment variable is required but was not provided.")',
                "const port = process.env.PORT || 5173;"
            );

            fs.writeFileSync(full, text);
        }
    }
}

fixFiles("./");
console.log("Project fixed successfully");