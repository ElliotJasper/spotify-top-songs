import { useEffect, useState } from "react";
import "./App.css";

function App() {
  let [songsAllTime, setSongsAllTime] = useState([]);
  let [songsShortTerm, setSongsShortTerm] = useState([]);
  let [artistsAllTime, setArtistsAllTime] = useState([]);

  useEffect(() => {
    const getData = async () => {
      let response = await fetch("/login", { mode: "no-cors" });
      let body = await response.text();
      window.location.replace(body);
    };

    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    };
    let cookie = getCookie("Access token");

    const showDataLongTerm = async () => {
      let url =
        "https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=long_term";
      let data = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + cookie,
        },
      });

      let body = await data.json();
      console.log(body);

      let allSongs = [];

      for (let i = 0; i < body.items.length; i++) {
        allSongs.push({
          song: body.items[i].name,
          artist: body.items[i].artists[0].name,
          image: body.items[i].album.images[2].url,
        });
      }

      setSongsAllTime(allSongs);
    };

    const showDataShortTerm = async () => {
      let url =
        "https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=short_term";
      let data = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + cookie,
        },
      });

      let body = await data.json();
      console.log(body);

      let allSongs = [];

      for (let i = 0; i < body.items.length; i++) {
        allSongs.push({
          song: body.items[i].name,
          artist: body.items[i].artists[0].name,
          image: body.items[i].album.images[2].url,
        });
      }

      setSongsShortTerm(allSongs);
    };

    const showArtistsAllTime = async () => {
      let url =
        "https://api.spotify.com/v1/me/top/artists?limit=20&time_range=short_term";
      let data = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + cookie,
        },
      });

      let body = await data.json();
      console.log(body);

      let allSongs = [];

      for (let i = 0; i < body.items.length; i++) {
        allSongs.push({
          artist: body.items[i].name,
          image: body.items[i].images[2].url,
        });
      }

      setArtistsAllTime(allSongs);
    };

    if (cookie == null) getData();
    showDataLongTerm();
    showDataShortTerm();
    showArtistsAllTime();
  }, []);
  return (
    <div className="App">
      <h1 className="top-tracks-header">Top Tracks and Artists</h1>
      <div className="lists-container">
        <div className="list-container">
          <h1 className="top-tracks">All Time</h1>
          <ul className="songs">
            {songsAllTime.map((item, index) => (
              <li key={index}>
                <img src={item.image} alt="no alt" />
                <p>
                  {item.artist} - {item.song}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="list-container">
          <h1 className="top-tracks">This Month</h1>
          <ul className="songs">
            {songsShortTerm.map((item, index) => (
              <li key={index}>
                <img src={item.image} alt="no alt" />
                <p>
                  {item.artist} - {item.song}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="list-container">
          <h1 className="top-tracks">Artists</h1>
          <ul className="songs">
            {artistsAllTime.map((item, index) => (
              <li key={index}>
                <img className="artist-image" src={item.image} alt="no alt" />
                <p>{item.artist}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
