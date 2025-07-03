const shareData = {
    title: "Tims Nightreign Helper",
    url: window.location.href
};
if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    console.log('Share is supported and can share data');
    const btn = document.getElementById('shareBtn');
    btn.classList.remove('hidden');
    btn.addEventListener('click', async () => {
        try {
            await navigator.share(shareData);
            console.log('Share successful');
        } catch (err) {
            // User cancelled or an error occurred
            console.error('Share failed:', err);
        }
    });
} else {
    console.error('Share not supported or cannot share data');
}