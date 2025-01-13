import React, { useState } from 'react';
import { Container, Box, Button, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function App() {
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [language, setLanguage] = useState('original');
  const [srtFilePath, setSrtFilePath] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    try {
      const response = await fetch('/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe the audio.');
      }

      const data = await response.json();
      setTranscription(data.transcription);
      setSrtFilePath(data.srt_file);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while transcribing the audio.");
    }
  };

  const handleDownload = () => {
    if (srtFilePath) {
      const encodedSrtFilePath = encodeURIComponent(srtFilePath);
      const downloadLink = document.createElement('a');
      downloadLink.href = `/download_srt?srt_file_path=${encodedSrtFilePath}`;
      downloadLink.setAttribute('download', 'transcription.srt');
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      alert("No SRT file available for download.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Audio Transcription and Translation
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            type="file"
            onChange={handleFileChange}
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ accept: 'audio/*' }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              value={language}
              label="Language"
              onChange={handleLanguageChange}
            >
              <MenuItem value="original">Original</MenuItem>
              <MenuItem value="english">English</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Upload
          </Button>
        </form>
        {transcription && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Transcription:</Typography>
            <Typography>{transcription}</Typography>
          </Box>
        )}
        {srtFilePath && (
          <Box sx={{ mt: 4 }}>
            <Button variant="contained" color="secondary" onClick={handleDownload} fullWidth>
              Download .srt File
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default App;
