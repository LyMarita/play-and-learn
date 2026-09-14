# Generate all game speech as mp3 files with neural voices (edge-tts).
# Run: uv run --with edge-tts python scripts/gen_audio.py
# Output: audio/en/<clipId>.mp3 and audio/km/<clipId>.mp3
# Phrase table mirrors js/i18n.js — keep them in sync.

import asyncio
import pathlib

import edge_tts

VOICES = {"en": "en-US-JennyNeural", "km": "km-KH-SreymomNeural"}
RATES = {"en": "-5%", "km": "+0%"}  # near-natural pace; heavy slowdown sounds robotic

STATIC = {
    "hub_welcome":  {"en": "What do you want to play?", "km": "តើចង់លេងអ្វី?"},
    "great_job":    {"en": "Great job!", "km": "ល្អណាស់!"},
    "great_job_2":  {"en": "Wonderful!", "km": "អស្ចារ្យ!"},
    "great_job_3":  {"en": "You are so clever!", "km": "ពូកែណាស់!"},
    "try_again":    {"en": "Try again!", "km": "សាកម្តងទៀត!"},
    "all_done":     {"en": "You did it! Amazing!", "km": "អ្នកធ្វើបានហើយ! អស្ចារ្យណាស់!"},
    "watch_me":     {"en": "Watch me!", "km": "មើលខ្ញុំ!"},
    "maze_intro":   {"en": "Help the bunny get the carrot!", "km": "ជួយទន្សាយយកការ៉ុត!"},
    "maze_blocked": {"en": "Oops! Bump!", "km": "អូ! ទង្គិចហើយ!"},
    "maze_short":   {"en": "Almost! Add more arrows!", "km": "ជិតដល់ហើយ! បន្ថែមព្រួញទៀត!"},
    "count_intro":  {"en": "Tap and count!", "km": "ចុចហើយរាប់!"},
    "how_many":     {"en": "How many?", "km": "មានប៉ុន្មាន?"},
}

NUM_KM = ["មួយ", "ពីរ", "បី", "បួន", "ប្រាំ", "ប្រាំមួយ", "ប្រាំពីរ", "ប្រាំបី", "ប្រាំបួន", "ដប់"]
NUM_EN = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]

COLORS = {
    "red": "ក្រហម", "blue": "ខៀវ", "green": "បៃតង",
    "yellow": "លឿង", "purple": "ស្វាយ", "orange": "ទឹកក្រូច",
}
SHAPES = {
    "circle": "រង្វង់", "square": "ការ៉េ", "triangle": "ត្រីកោណ", "star": "ផ្កាយ",
}


def build_phrases():
    phrases = {}  # clipId -> {en, km}
    phrases.update(STATIC)
    for i in range(10):
        phrases[f"num_{i + 1}"] = {"en": NUM_EN[i], "km": NUM_KM[i]}
    for letter in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        phrases[f"tap_letter_{letter}"] = {
            "en": f"Tap the letter {letter}!",
            "km": f"ចុចអក្សរ {letter}!",
        }
    for c_en, c_km in COLORS.items():
        for s_en, s_km in SHAPES.items():
            phrases[f"find_it_{c_en}_{s_en}"] = {
                "en": f"Find the {c_en} {s_en}!",
                "km": f"រក{s_km}ពណ៌{c_km}!",
            }
    return phrases


async def gen_one(sem, lang, clip_id, text):
    out = pathlib.Path("audio") / lang / f"{clip_id}.mp3"
    if out.exists():
        return
    async with sem:
        tts = edge_tts.Communicate(text, VOICES[lang], rate=RATES[lang])
        await tts.save(str(out))
        print(f"{out}")


async def main():
    phrases = build_phrases()
    for lang in VOICES:
        (pathlib.Path("audio") / lang).mkdir(parents=True, exist_ok=True)
    sem = asyncio.Semaphore(5)
    tasks = [
        gen_one(sem, lang, clip_id, texts[lang])
        for clip_id, texts in phrases.items()
        for lang in VOICES
    ]
    await asyncio.gather(*tasks)
    print(f"done: {len(tasks)} clips")


asyncio.run(main())
