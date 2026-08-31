
const colors = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",

    cyan: "\x1b[36m",
    blue: "\x1b[34m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
};

function log(level: string, color: string, message: string, ...args: unknown[]) {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0]; // HH:mm:ss

    const prefix = `${colors.dim}${colors.reset}${color}${colors.bold}[${level}]${colors.reset}`;
    console.log(`${colors.dim}${timestamp}${colors.reset} ${prefix} ${message}`, ...args);
}

const Debug = (message: string, ...args: unknown[]) => {
    if (process.env.DEBUG_MODE) log("DEBUG", colors.cyan, message, ...args)
};
const Info = (message: string, ...args: unknown[]) => log("INFO", colors.blue, message, ...args);
const Warning = (message: string, ...args: unknown[]) => log("WARNING", colors.yellow, message, ...args);
const Error = (message: string, ...args: unknown[]) => log("ERROR", colors.red, message, ...args);

export default {
    Debug,
    Info,
    Warning,
    Error,
};