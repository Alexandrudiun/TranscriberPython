from flask import Flask, request, jsonify, send_file, after_this_request
import whisper
import os
from googletrans import Translator
import tempfile

app = Flask(__name__)

model = whisper.load_model("medium")
translator = Translator()

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
        file_path = temp_file.name
        file.save(file_path)

    srt_file_path = None
    try:
        result = model.transcribe(file_path)
        transcription = result['text']
        language = request.form.get('language', 'original')

        if language == 'english':
            translated = translator.translate(transcription, dest='en')
            transcription = translated.text

        srt_file_path = file_path + '.srt'
        with open(srt_file_path, 'w', encoding='utf-8') as srt_file:
            for i, segment in enumerate(result['segments']):
                start_time = segment['start']
                end_time = segment['end']
                text = segment['text']
                if language == 'english':
                    text = translator.translate(text, dest='en').text

                start_hours, start_minutes, start_seconds = int(start_time // 3600), int((start_time % 3600) // 60), start_time % 60
                end_hours, end_minutes, end_seconds = int(end_time // 3600), int((end_time % 3600) // 60), end_time % 60

                start_timestamp = f"{start_hours:02}:{start_minutes:02}:{start_seconds:06.3f}".replace('.', ',')
                end_timestamp = f"{end_hours:02}:{end_minutes:02}:{end_seconds:06.3f}".replace('.', ',')

                srt_file.write(f"{i + 1}\n")
                srt_file.write(f"{start_timestamp} --> {end_timestamp}\n")
                srt_file.write(f"{text}\n\n")

        print(f"Generated SRT file path: {srt_file_path}")
        print(f"Content of the SRT file:\n{open(srt_file_path, 'r', encoding='utf-8').read()}")

        response = jsonify({"transcription": transcription, "srt_file": srt_file_path})
        return response
    finally:
        os.remove(file_path)

@app.route('/download_srt', methods=['GET'])
def download_srt():
    srt_file_path = request.args.get('srt_file_path')
    print(f"Requested SRT file path: {srt_file_path}")
    if os.path.exists(srt_file_path):
        @after_this_request
        def remove_file(response):
            try:
                os.remove(srt_file_path)
            except Exception as e:
                print(f"Error removing or closing downloaded file handle: {e}")
            return response
        print(f"Sending SRT file: {srt_file_path}")
        return send_file(srt_file_path, as_attachment=True, download_name='transcription.srt')
    else:
        return jsonify({"error": "File not found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
