import bcrypt from "bcryptjs";
import CryptoJS from "crypto-js";

export type HtpasswdMethod = "bcrypt" | "sha1" | "plain";

export const htpasswdMethodOptions = [
    { value: "bcrypt", labelKey: "htpasswd_method_bcrypt" },
    { value: "sha1", labelKey: "htpasswd_method_sha1" },
    { value: "plain", labelKey: "htpasswd_method_plain" },
] as const;

export const createHtpasswdHash = (password: string, method: HtpasswdMethod, bcryptCost = 10) => {
    if (method === "bcrypt") {
        const cost = Math.min(15, Math.max(4, Math.floor(bcryptCost)));
        return bcrypt.hashSync(password, bcrypt.genSaltSync(cost));
    }

    if (method === "sha1") {
        return `{SHA}${CryptoJS.enc.Base64.stringify(CryptoJS.SHA1(password))}`;
    }

    return password;
};

export const createHtpasswdLine = (
    username: string,
    password: string,
    method: HtpasswdMethod,
    bcryptCost = 10,
) => {
    return `${username}:${createHtpasswdHash(password, method, bcryptCost)}`;
};

export const nginxBasicAuthSnippet = `server {
    auth_basic "Restricted Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
}`;
