import { watch } from "vue";

import { formatArtists, formatTitle } from "./format";
import { usePlaybackStore } from "./stores/playback";
import { makeThumbnailURL } from "./api/endpoints";

export default function setupBroadcasts() {

    const playback = usePlaybackStore();

    // Browser window title
    watch(() => playback.currentSong, (song) => {
        if (!song) {
            document.title = "Polaris";
            return;
        }

        let artists: string[] = [];
        if (song.artists?.length) {
            artists = song.artists;
        } else if (song.album_artists?.length) {
            artists = song.album_artists;
        }

        const artistText = artists.length ? formatArtists(artists) : "Unknown Artist";
        const titleText = formatTitle(song);
        document.title = `${artistText} - ${titleText}`;
    });

    // Media session
    watch(() => playback.currentSong, (song) => {
        if (!navigator.mediaSession || !MediaMetadata) {
            return;
        }

        if (!song) {
            navigator.mediaSession.metadata = null;
            return;
        }

        let metadata = new MediaMetadata({
            title: song.title,
            album: song.album,
        });

        if (song.artists?.length) {
            metadata.artist = formatArtists(song.artists);
        } else if (song.album_artists?.length) {
            metadata.artist = formatArtists(song.album_artists);
        }

        if (song.artwork) {
            metadata.artwork = [{ src: makeThumbnailURL(song.artwork, "small") }];
        }

        navigator.mediaSession.metadata = metadata;
    });

    watch(() => [playback.elapsedSeconds, playback.duration], () => {
        if (!navigator.mediaSession || !navigator.mediaSession.setPositionState) {
            return;
        }

        navigator.mediaSession.setPositionState({
            position: playback.elapsedSeconds,
            duration: playback.duration,
            playbackRate: 1,
        });
    });

}
