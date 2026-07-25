class SetList {
    constructor(id, name, key) {
        this.id = id || crypto.randomUUID();
        this.name = name;
        this.key = key;
        this.songs = [];
        this.createdAt = new Date().toISOString();
        this.isPublic = false;
        this.publishedAt = null;
    }

    addSong(song) {
        song.key = this.key;
        this.songs.push(song);
        return this;
    }

    getSongCount() {
        return this.songs.length;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            key: this.key,
            songs: this.songs.map(s => s.toJSON()),
            createdAt: this.createdAt,
            isPublic: this.isPublic,
            publishedAt: this.publishedAt
        };
    }

    static fromJSON(data) {
        const setlist = new SetList(data.id, data.name, data.key);
        setlist.createdAt = data.createdAt || new Date().toISOString();
        setlist.isPublic = data.isPublic || false;
        setlist.publishedAt = data.publishedAt || null;
        if (data.songs) {
            setlist.songs = data.songs.map(s => Song.fromJSON(s));
        }
        return setlist;
    }
}

class Song {
    constructor(id, title, artist, key, lyrics) {
        this.id = id || crypto.randomUUID();
        this.title = title;
        this.artist = artist;
        this.key = key;
        this.lyrics = lyrics;
        this.createdAt = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            artist: this.artist,
            key: this.key,
            lyrics: this.lyrics,
            createdAt: this.createdAt
        };
    }

    static fromJSON(data) {
        const song = new Song(data.id, data.title, data.artist, data.key, data.lyrics);
        song.createdAt = data.createdAt || new Date().toISOString();
        return song;
    }
}