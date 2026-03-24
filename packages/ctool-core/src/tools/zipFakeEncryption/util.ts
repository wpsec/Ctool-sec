const ZIP_LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const ZIP_CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
const ZIP_GENERAL_PURPOSE_ENCRYPTED_FLAG = 0x0001;
const ZIP_MIN_EOCD_SIZE = 22;
const ZIP_MAX_COMMENT_SIZE = 65535;

const setEncryptedBit = (view: DataView, offset: number) => {
    const flag = view.getUint16(offset, true);
    if ((flag & ZIP_GENERAL_PURPOSE_ENCRYPTED_FLAG) !== 0) {
        return false;
    }
    view.setUint16(offset, flag | ZIP_GENERAL_PURPOSE_ENCRYPTED_FLAG, true);
    return true;
};

const findEndOfCentralDirectoryOffset = (view: DataView) => {
    if (view.byteLength < ZIP_MIN_EOCD_SIZE) {
        return -1;
    }
    const end = view.byteLength - ZIP_MIN_EOCD_SIZE;
    const start = Math.max(0, view.byteLength - ZIP_MIN_EOCD_SIZE - ZIP_MAX_COMMENT_SIZE);

    for (let offset = end; offset >= start; offset--) {
        if (view.getUint32(offset, true) === ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE) {
            return offset;
        }
    }
    return -1;
};

const withZipExtension = (name: string) => {
    if (!name) {
        return "archive.zip";
    }
    return name.toLowerCase().endsWith(".zip") ? name : `${name}.zip`;
};

export interface ZipPseudoEncryptionResult {
    outputBuffer: ArrayBuffer;
    totalEntries: number;
    updatedEntries: number;
    alreadyEncryptedEntries: number;
}

export const buildZipPseudoEncrypted = (sourceBuffer: ArrayBuffer): ZipPseudoEncryptionResult => {
    const outputBuffer = sourceBuffer.slice(0);
    const view = new DataView(outputBuffer);

    const eocdOffset = findEndOfCentralDirectoryOffset(view);
    if (eocdOffset === -1) {
        throw new Error("无法识别 ZIP 结构（EOCD 未找到）");
    }

    const totalEntries = view.getUint16(eocdOffset + 10, true);
    const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);
    const centralDirectorySize = view.getUint32(eocdOffset + 12, true);

    if (totalEntries === 0xffff || centralDirectoryOffset === 0xffffffff || centralDirectorySize === 0xffffffff) {
        throw new Error("暂不支持 ZIP64 文件");
    }
    if (centralDirectoryOffset + centralDirectorySize > view.byteLength) {
        throw new Error("ZIP 中央目录越界");
    }

    let pointer = centralDirectoryOffset;
    let updatedEntries = 0;
    let alreadyEncryptedEntries = 0;

    for (let index = 0; index < totalEntries; index++) {
        if (pointer + 46 > view.byteLength || view.getUint32(pointer, true) !== ZIP_CENTRAL_DIRECTORY_SIGNATURE) {
            throw new Error("ZIP 中央目录结构异常");
        }

        const localHeaderOffset = view.getUint32(pointer + 42, true);
        if (localHeaderOffset + 30 > view.byteLength || view.getUint32(localHeaderOffset, true) !== ZIP_LOCAL_FILE_HEADER_SIGNATURE) {
            throw new Error("ZIP 本地文件头结构异常");
        }

        const centralUpdated = setEncryptedBit(view, pointer + 8);
        const localUpdated = setEncryptedBit(view, localHeaderOffset + 6);
        if (centralUpdated || localUpdated) {
            updatedEntries++;
        } else {
            alreadyEncryptedEntries++;
        }

        const fileNameLength = view.getUint16(pointer + 28, true);
        const extraLength = view.getUint16(pointer + 30, true);
        const commentLength = view.getUint16(pointer + 32, true);
        pointer += 46 + fileNameLength + extraLength + commentLength;
    }

    return {
        outputBuffer,
        totalEntries,
        updatedEntries,
        alreadyEncryptedEntries,
    };
};

export const buildPseudoEncryptedFileName = (originFileName: string) => {
    const name = withZipExtension(originFileName);
    if (name.toLowerCase().endsWith(".zip")) {
        return `${name.slice(0, -4)}-pseudo-encrypted.zip`;
    }
    return `${name}-pseudo-encrypted.zip`;
};
