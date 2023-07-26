import os
import json
import threading
from flask import Flask, render_template, request, jsonify
from cryptography.fernet import Fernet
from scrapy.http import HtmlResponse
import wget
from flask_socketio import SocketIO, emit

app = Flask(__name__, static_url_path='/static', static_folder='static')
app.config['SECRET_KEY'] = 'secret_key'
socketio = SocketIO(app)

# Replace with your own secret key for encryption and decryption
SECRET_KEY = b'9I6OYZKBptUNiSKQ0qymsEAtMlIuFVjBeXOnS1szbgo='
cipher_suite = Fernet(SECRET_KEY)

# Replace this with an actual database for better persistence (e.g., SQLite, PostgreSQL, etc.)
media_db = {}

class MediaScraper:
    def __init__(self, url):
        self.url = url

    def parse_urls(self, response):
        # Replace this method with actual web scraping logic to extract media URLs
        # For example, if you're scraping image URLs from 'img' tags:
        urls = response.css('img::attr(src)').extract()
        return urls

    def scrape_media_urls(self):
        response = HtmlResponse(url=self.url)
        media_urls = self.parse_urls(response)
        return media_urls

def download_and_encrypt_media(media_url, media_type, extension):
    try:
        # Create a directory to save the downloaded media files
        save_directory = os.path.join(os.getcwd(), 'downloaded_media')
        os.makedirs(save_directory, exist_ok=True)

        media_save_path = os.path.join(save_directory, f"{media_type}_{extension}.{extension}")

        # Download the media from the provided URL and save it to the local storage
        wget.download(media_url, out=media_save_path)

        # Encrypt the downloaded media file
        with open(media_save_path, 'rb') as file:
            file_data = file.read()
        encrypted_data = cipher_suite.encrypt(file_data)
        with open(media_save_path, 'wb') as file:
            file.write(encrypted_data)

        media_db[media_url] = {'status': 'Downloaded', 'progress': 100}
        emit('media_status', media_db, broadcast=True)  # Update progress via WebSocket
    except Exception as e:
        print(f"Error during media download process: {e}")
        media_db[media_url] = {'status': 'Error', 'progress': 0}
        emit('media_status', media_db, broadcast=True)  # Update progress via WebSocket

def download_media_thread(media_url, media_type, extension):
    t = threading.Thread(target=download_and_encrypt_media, args=(media_url, media_type, extension))
    t.start()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scrape_and_download', methods=['POST'])
def scrape_and_download():
    try:
        # Get the URL and media type (video, audio, image) from the request
        url = request.form['url']
        media_type = request.form['type']
        extension = request.form['extension']

        # Scrape media URLs from the provided URL
        scraper = MediaScraper(url)
        media_urls = scraper.scrape_media_urls()

        if not media_urls:
            return jsonify({'error': 'Failed to extract media URLs.'}), 400

        # Start downloading and encrypting media files concurrently
        for media_url in media_urls:
            download_media_thread(media_url, media_type, extension)

        return jsonify({'success': True, 'message': 'Media files download and encryption started.'}), 200
    except Exception as e:
        print(f"Error during media download process: {e}")
        return jsonify({'error': 'Failed to download media.'}), 500

@app.route('/media_status', methods=['GET'])
def get_media_status():
    return jsonify(media_db)

@socketio.on('connect')
def handle_connect():
    emit('media_status', media_db)

if __name__ == '__main__':
    socketio.run(app, debug=True)

