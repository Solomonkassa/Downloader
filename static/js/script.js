document.addEventListener('DOMContentLoaded', () => {
  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn.addEventListener('click', downloadMedia);

  const downloadQueue = document.getElementById('downloadQueue');
  let mediaQueue = [];

  async function downloadMedia() {
    const mediaUrl = document.getElementById('mediaUrl').value;
    const mediaType = document.getElementById('mediaType').value;
    const extensionType = document.getElementById('extensionType').value;

    if (mediaUrl) {
      const mediaItem = createMediaItem(mediaUrl);
      downloadQueue.appendChild(mediaItem);

      const mediaData = { url: mediaUrl, type: mediaType, extension: extensionType, progress: 0 };
      mediaQueue.push(mediaData);

      if (mediaQueue.length === 1) {
        await downloadNextMedia();
      }
    }
  }

  function createMediaItem(url) {
    const mediaItem = document.createElement('div');
    mediaItem.classList.add('media-item', 'mb-2', 'p-2', 'border', 'rounded');
    mediaItem.innerHTML = `
      <span class="media-url">${url}</span>
      <span class="status">Downloading...</span>
      <div class="progress">
        <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
    `;
    return mediaItem;
  }

  async function downloadNextMedia() {
    if (mediaQueue.length > 0) {
      const media = mediaQueue[0];
      try {
        const response = await fetch('/scrape_and_download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: media.url, type: media.type, extension: media.extension })
        });

        if (!response.ok) {
          throw new Error(`Failed to download media: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
          updateMediaItemStatus(media.url, 'Downloaded');
          mediaQueue.shift();
          showSuccessAlert(data.type);
        } else {
          throw new Error(`Failed to download media: ${data.error}`);
        }
      } catch (error) {
        console.log(error.message);
        updateMediaItemStatus(media.url, 'Error');
      } finally {
        await downloadNextMedia();
      }
    }
  }

  function updateMediaItemStatus(url, status) {
    const mediaItem = downloadQueue.querySelector(`.media-url:contains("${url}")`).parentElement;
    mediaItem.querySelector('.status').innerText = status;
  }

  function showSuccessAlert(mediaType) {
    const successAlert = document.createElement('div');
    successAlert.classList.add('alert', 'alert-success', 'mt-2', 'p-2');
    successAlert.innerText = `${mediaType.toUpperCase()} file downloaded successfully.`;
    downloadQueue.insertAdjacentElement('beforebegin', successAlert);
    setTimeout(() => successAlert.remove(), 3000);
  }

  // WebSocket connection to get real-time media download progress
  const socket = io.connect(window.location.origin);
  socket.on('media_status', (data) => {
    mediaQueue.forEach((mediaData) => {
      const mediaUrl = mediaData.url;
      if (mediaUrl in data) {
        const mediaStatus = data[mediaUrl];
        const progress = mediaStatus.progress;
        const mediaItem = downloadQueue.querySelector(`.media-url:contains("${mediaUrl}")`).parentElement;
        mediaItem.querySelector('.status').innerText = mediaStatus.status;
        const progressBar = mediaItem.querySelector('.progress-bar');
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
      }
    });
  });
});

