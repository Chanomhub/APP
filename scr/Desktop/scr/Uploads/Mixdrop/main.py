import requests
import argparse
import os

def upload_file(email, key, file_path):
    if not os.path.isfile(file_path):
        print("File not found:", file_path)
        return None
    
    url = "https://ul.mixdrop.ag/api"
    proxies = {
        # Add your proxies here if needed
    }
    with open(file_path, 'rb') as file:
        files = {
            'email': (None, email),
            'key': (None, key),
            'file': (file_path, file)
        }
        try:
            response = requests.post(url, files=files, proxies=proxies, timeout=300)  # Timeout set to 5 minutes
            json_response = response.json()
            if 'result' in json_response and 'url' in json_response['result']:
                return json_response['result']['url']
            else:
                print("Upload failed:", json_response)
                return None
        except requests.exceptions.RequestException as e:
            print("Upload failed:", e)
            return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload file to Mixdrop")
    parser.add_argument("-e", "--email", help="Your email address", required=True)
    parser.add_argument("-k", "--key", help="Your API key", required=True)
    parser.add_argument("-f", "--file", help="Path to the file to upload", required=True)
    args = parser.parse_args()

    email = args.email
    key = args.key
    file_path = args.file

    url = upload_file(email, key, file_path)
    if url:
        print(url)
