import { watch } from "vue";

import { lastFMNowPlaying, lastFMScrobble, makeThumbnailURL } from "./api/endpoints";
import { formatArtists, formatTitle } from "./format";
import { usePlaybackStore } from "./stores/playback";
import { usePreferencesStore } from "./stores/preferences";

export default function setupBroadcasts() {

    const playback = usePlaybackStore();
    const preferences = usePreferencesStore();

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

    // Last.fm
    watch(() => playback.currentTrack, () => {
        playback.setScrobbleAllowed(true);
        if (playback.currentTrack && preferences.lastFMUsername) {
            lastFMNowPlaying(playback.currentTrack.path);
        }
    });

    watch(() => playback.elapsedSeconds, () => {
        if (!playback.scrobbleAllowed || !playback.currentTrack) {
            return;
        }
        const progress = playback.elapsedSeconds / playback.duration;
        const shouldScrobble = preferences.lastFMUsername && playback.duration > 30 && (progress > 0.5 || playback.elapsedSeconds > 4 * 60);
        if (shouldScrobble) {
            lastFMScrobble(playback.currentTrack.path);
            playback.setScrobbleAllowed(false);
        }
    });

}
