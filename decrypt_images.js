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

async function decryptData(encryptedData, password, salt, nonce) {
   try {
       console.log(0)
       const iv = base64_to_buf(nonce)
       console.log(1)
       const data = base64_to_buf(encryptedData)
       console.log(2)
       const passwordKey = await getPasswordKey(password);
       console.log(3)
       const iterations = 1000000
       console.log(4)
       const aesKey = await deriveKey(passwordKey, salt, iterations, ["decrypt"], "SHA-256");
       console.log(5)
       const decryptedContent = await window.crypto.subtle.decrypt(
           {
               name: "AES-GCM",
               iv: iv,
           },
           aesKey,
           data
       );
       console.log(6)
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
    Object.entries(imgs).forEach( ([image_name, value]) => {
        decryptData(value["ciphertext"], password, fromHex(salt), value["nonce"]).then((dec) => {
            if (image_name == "rsvp") {
                $(".rsvp").attr("href", dec)
            } else {
                $("img[src='" + image_name + "']").attr("src", "data:image/png;base64, " + dec)
            }
        })
    })
})