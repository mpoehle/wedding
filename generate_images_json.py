import base64
import json
import os
from hashlib import pbkdf2_hmac

from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes


file_path = os.path.realpath(__file__)
folder = os.path.dirname(file_path)


def generate_key(password, iterations=10**6, salt=None):
    if salt is None:
        salt = get_random_bytes(16)
    key = pbkdf2_hmac('sha256', password.encode("ascii"), salt, iterations, 32)
    return iterations, salt, key


def encrypt(data, key):
    cipher = AES.new(key, AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(data)

    json_k = ['nonce', 'ciphertext']
    json_v = [base64.b64encode(cipher.nonce).decode('ascii'), base64.b64encode(ciphertext + tag).decode('ascii')]
    result = dict(zip(json_k, json_v))
    return result


if __name__ == "__main__":
    password = input("password: ")
    iterations, salt, key = generate_key(password)

    encrypted_images = {}

    for (root, dirs, files) in os.walk(os.path.join(folder, "static", "img")):
        for file in files:
            with open(os.path.join(folder, "static", "img", file), "rb") as f:
                encrypted_images[file] = encrypt(base64.b64encode(f.read()), key)
    rsvp_url = input("rsvp url: ")
    encrypted_images["rsvp"] = encrypt(rsvp_url.encode("ascii"), key)


    data = {
        f"{iterations}:{salt.hex()}": encrypted_images
    }

    with open("images.js", "w") as f:
        f.write(f"const images = {json.dumps(data)}")
