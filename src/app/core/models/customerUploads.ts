export interface CustomerUpload {
    _id: string;
    holdingOrg: string;
    size: number;
    file: GridFsFile;
    status: string;
}

export interface GridFsFile {
    length: number;
    uploadDate: Date;
    filename: string;
}