import axios from 'axios';

const API_URL = "http://localhost:5000";

export const registerUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/user/register`, {
      username,
      password
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error registering user" };
  }
};

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/user/login`, {
      username,
      password
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error logging in" };
  }
};

export const addSong = async (song, lyricist, lyrics) => {
  try {
    const response = await axios.post(`${API_URL}/songs`, {
      song,
      lyricist,
      lyrics
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error adding song" };
  }
};

export const getSongs = async () => {
  try {
    const response = await axios.get(`${API_URL}/songs`);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};
