const buff_to_base64 = (buff) => btoa(
   new Uint8Array(buff).reduce(
       (data, byte) => data + String.fromCharCode(byte), ''
   )
);


const base64_to_buf = (b64) =>
   Uint8Array.from(atob(b64), (c) => c.charCodeAt(null));


async function exportKey(k) {
   const exported = await window.crypto.subtle.exportKey("jwk", k);
   console.log(exported.k)
   return exported.k;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

async function encrypt() {
   const data = window.document.getElementById("data").value;
   let encryptedDataOut = window.document.getElementById("encryptedData");
   let password = window.document.getElementById("password");
   const encryptedData = await encryptData(data, password);
   encryptedDataOut.value = encryptedData;
}

async function decrypt() {

   let password = window.document.getElementById("password");
   const encryptedData = window.document.getElementById("encryptedData").value;
   let decryptedDataOut = window.document.getElementById("decrypted");
   const decryptedData = await decryptData(encryptedData, password);
   decryptedDataOut.value = decryptedData || "The decryption did not work";
}

const getPasswordKey = (password) =>
   window.crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
       "deriveKey",
   ]);

const deriveKey = (passwordKey, salt, n,keyUsage,hashing) =>
   window.crypto.subtle.deriveKey(
       {
           name: "PBKDF2",
           salt: salt,
           iterations: n,
           hash: hashing,
       },
       passwordKey,
       { name: "AES-GCM", length: 256 },
       true, // extractable true
       keyUsage
   );

const fromHex = (hexString) =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const toHex = (bytes) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');


async function encryptData(secretData, password) {
   try {
       const salt = fromHex("ffddff");
       const iv = fromHex("ffddcc")

       const passwordKey = await getPasswordKey(password);

       const iterations = 1000000
       const aesKey = await deriveKey(passwordKey, salt, iterations, ["encrypt"], "SHA-256");


       const k = await exportKey(aesKey);

       const encryptedContent = await window.crypto.subtle.encrypt(
           {
               name: "AES-GCM",
               iv: iv,
           },
           aesKey,
           enc.encode(secretData)
       );

       const encryptedContentArr = new Uint8Array(encryptedContent);
       let buff = new Uint8Array(
           salt.byteLength + iv.byteLength + encryptedContentArr.byteLength
       );
       buff.set(salt, 0);
       buff.set(iv, salt.byteLength);
       buff.set(encryptedContentArr, salt.byteLength + iv.byteLength);
       const base64Buff = buff_to_base64(buff);
       return base64Buff;
   } catch (e) {
       console.log(`Error - ${e}`);
       console.log(e.stack)
       return "";
   }
}

async function decryptData(encryptedData, authentication_tag, password, salt, nonce) {
   try {
       const iv = base64_to_buf(nonce)
       const data = base64_to_buf(encryptedData + authentication_tag)
       const passwordKey = await getPasswordKey(password);
       const iterations = 1000000
       const aesKey = await deriveKey(passwordKey, salt, iterations, ["decrypt"], "SHA-256");
       const decryptedContent = await window.crypto.subtle.decrypt(
           {
               name: "AES-GCM",
               iv: iv,
           },
           aesKey,
           data
       );
       return dec.decode(decryptedContent);
   } catch (e) {
       console.log(`Error - ${e}`);
       console.log(e.stack)
       return "";
   }
}


$(document).ready(() => {
    const k = Object.keys(images)[0]
    const [iterations, salt] = k.split(":")
    imgs = images[k]

    password = prompt("password: ")
    Object.entries(imgs).forEach( ([key, value]) => {
        decryptData(value["ciphertext"], value["tag"], password, fromHex(salt), value["nonce"]).then((dec) => {
            console.log(dec)
        })
        decryptData("JPX6ngpj", "8dHvpSqSHabt1b9z91cB9Q==", password, fromHex("ffddff"), "/93M").then((dec) => {
            console.log(dec)
        })
    })
})