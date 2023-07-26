# Media Downloader

Media Downloader is a web application that allows users to download and encrypt media files (e.g., images) from a given URL. It uses Flask as the web framework for the backend, and JavaScript with jQuery and Bootstrap for the frontend.

## Features

- Download and encrypt media files from a provided URL.
- Real-time progress updates for media download and encryption.
- Display media download status and progress.

## Prerequisites

Before running the application, make sure you have the following installed:

- Python 3
- pip (Python package manager)

## Installation

1. Clone the repository:

```
git clone <repository_url>
cd downloader
```
2. Create a virtual environment (optional but recommended):
```
python3 -m venv venv
source venv/bin/activate
```
3 .Install the required dependencies:
```
pip install -r requirements.txt
```
4. Run the Flask development server:
```
python app.py
Access the application in your web browser at http://127.0.0.1:5000.
```
Enter the URL of the webpage containing media files, select the media type, and the file extension you want to download.

Click the "Download" button to initiate the download and encryption process. The application will start downloading and encrypting the media files concurrently.

The download progress and status of each media file will be displayed in real-time.

* Technologies Used
* Python
* Flask
* JavaScript
* jQuery
* Bootstrap
* WebSocket
MIT License

## Copyright (c) 2023 Solomon Kassa
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)






