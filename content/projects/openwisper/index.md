---
title: OpenWisper
description: Local, offline-first dictation for macOS. Hold a key, talk, and the cleaned-up text lands wherever your cursor is.
year: "2026"
kind: personal
stack: [Swift, whisper.cpp, Metal, AVAudioEngine]
links:
  live: https://redoni18.github.io/openwisper/
  repo: https://github.com/Redoni18/openwisper
featured: true
order: 4
preview:
  src: /projects/openwisper/preview.webp
  srcDark: /projects/openwisper/preview-dark.webp
  alt: "OpenWisper's landing page: the app icon above the headline 'Talk. It types. Nothing leaves your Mac.'"
  og: /projects/openwisper/og.jpg
---

OpenWisper is a dictation app for macOS. You hold a key, say what you want to write, let go, and the text appears wherever your cursor is: a Slack message, an email, a code comment, a terminal. It gets cleaned up on the way, so "um, so basically, new paragraph" turns into proper punctuation and a line break instead of being typed out word for word.

What I cared about most is where your voice goes, and by default the answer is nowhere. Transcription runs on your own Mac through [whisper.cpp](https://github.com/ggml-org/whisper.cpp), an open-source C/C++ port of OpenAI's Whisper speech model, so it keeps working with the Wi-Fi off. Cloud transcription (Groq or OpenAI) and an LLM cleanup pass are available if you want them. They're opt-in, and they only run with API keys you paste in yourself.

## Why I built it

I'd been using Wispr Flow and liked it a lot. For anything longer than a sentence, talking is faster than typing, and after a week or so it stops feeling strange. What I didn't like was the account, the subscription, and every sentence I said going to someone else's server. Speech models small enough to run on a laptop had become good enough that none of that seemed necessary anymore. So I built the version I wanted: a menu bar app with no Dock icon, no sign-up, and nothing leaving the machine unless I ask it to.

## How it fits together

Every dictation goes through the same five steps:

1. **Hotkey.** A global keyboard listener notices the key going down and coming back up. It doesn't interpret anything. It only reports "down", "up" and "Esc".
2. **Record.** The microphone is captured into memory as 16 kHz mono audio, the format Whisper models expect. It's never written to disk.
3. **Transcribe.** The audio goes to whichever engine is configured: the local whisper.cpp model by default, or a cloud API.
4. **Clean up.** Optionally, the raw transcript goes through a short LLM prompt that removes filler words and fixes punctuation.
5. **Insert.** The final text is pasted into whatever app is in front.

It's written in Swift, with AppKit for the windows and menu bar and SwiftUI for the views inside them. It builds with Swift Package Manager and a Makefile instead of an Xcode project, and it has no third-party Swift packages. whisper.cpp is compiled from source and linked into the app with Metal enabled, so the model runs on the GPU. The model is loaded once and then stays in memory, which is why there's no pause for it to reload between dictations.

::figure{src="/projects/openwisper/window-history-light.png" srcDark="/projects/openwisper/window-history-dark.png" alt="OpenWisper's History window showing a list of past transcripts with their source engine" caption="Every transcript is kept locally, one click from the clipboard." width="1200" height="1200"}
::

## What the write-ups cover

Most of the interesting code in this project isn't the speech recognition, since whisper.cpp does that part. It's everything around it: working out what a key press *means*, and making sure nothing you said gets lost between the microphone and the cursor.

::link-card{title="One key, two gestures" description="How a single hotkey does push-to-talk and hands-free mode without asking which one you meant." to="/projects/openwisper/hotkey"}
::

::link-card{title="Never losing what you said" description="Local transcription, a cleanup step that's allowed to fail, and a paste that doesn't wreck your clipboard." to="/projects/openwisper/pipeline"}
::
