"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelDownload = exports.pauseDownload = exports.addDownload = exports.getDownloads = void 0;
// /mnt/data/downloadManager.ts
const path_1 = __importDefault(require("path"));
const downloads = [];
function getDownloads() {
    return downloads;
}
exports.getDownloads = getDownloads;
function addDownload(filePath) {
    downloads.push({
        id: filePath,
        name: path_1.default.basename(filePath),
        status: 'completed'
    });
}
exports.addDownload = addDownload;
function pauseDownload(id) {
    const download = downloads.find(d => d.id === id);
    if (download) {
        download.status = 'paused';
    }
}
exports.pauseDownload = pauseDownload;
function cancelDownload(id) {
    const index = downloads.findIndex(d => d.id === id);
    if (index !== -1) {
        downloads.splice(index, 1);
    }
}
exports.cancelDownload = cancelDownload;
