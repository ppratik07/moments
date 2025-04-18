"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.eventType.createMany({
            data: [
                {
                    name: "Birthday",
                    description: "Birthdays are a celebration of life, growth, and the unique light each person brings into the world. Whether it’s a quiet moment or a lively party, honoring someone’s special day with shared memories, photos, and personal messages adds an unforgettable touch. Make them feel seen and cherished by capturing the joy, laughter, and love they’ve brought into your life. A birthday memory gift is a timeless way to show how much they mean to you.Birthdays are a celebration of life, growth, and the unique light each person brings into the world. Whether it’s a quiet moment or a lively party, honoring someone’s special day with shared memories, photos, and personal messages adds an unforgettable touch. Make them feel seen and cherished by capturing the joy, laughter, and love they’ve brought into your life. A birthday memory gift is a timeless way to show how much they mean to you.",
                },
                {
                    name: "Wedding",
                    description: "Weddings mark the beginning of a beautiful journey together. Celebrate this momentous occasion with heartfelt messages, shared memories, and blessings from loved ones. From “I do” to forever, capture the love, joy, and promises exchanged on their special day. A memory gift or tribute becomes a cherished keepsake that reflects the depth of their bond and the support surrounding them. Help preserve the magic and emotion of the day for the couple to revisit for years to come.",
                },
                {
                    name: "Wedding Anniversary",
                    description: "Each anniversary is a celebration of enduring love, shared challenges, and treasured memories. Whether its the first or fiftieth year together, take time to reflect on the journey that continues to grow stronger with each passing day. Share thoughtful notes, favorite moments, and stories that remind the couple of their incredible bond. An anniversary memory is a heartfelt tribute that honors not just a date, but a lifetime of connection, commitment, and the beauty of growing together.",
                },
                {
                    name: "Father’s Day",
                    description: "Fathers and father figures shape us in quiet, powerful ways — with guidance, encouragement, and endless support. Father’s Day is the perfect opportunity to recognize all he’s done with words that go beyond the surface. Share personal stories, lessons learned, and meaningful moments that reflect his role in your life. A memory gift becomes a tribute to his strength, kindness, and influence. Show your appreciation with something thoughtful he can revisit and cherish again and again.",
                },
                {
                    name: "Mother's Day",
                    description: "Mothers are the heart of the home — nurturing, guiding, and loving unconditionally. On Mother’s Day, express your gratitude with a collection of memories, messages, and tokens of appreciation that reflect her impact on your life. Whether she’s near or far, a heartfelt tribute helps her feel deeply valued. Celebrate her strength, care, and all the little things she’s done to shape your world. Show her how much she’s loved, not just today, but always.",
                },
                {
                    name: "Memorial",
                    description: "Graduation is a powerful milestone — the closing of one chapter and the exciting start of another. Celebrate academic achievements and the journey it took to reach this moment. Capture words of encouragement, stories from the path, and dreams for the future. Whether it’s high school, college, or any level in between, this occasion deserves to be remembered with pride and love. Help the graduate feel seen, supported, and inspired as they step boldly into what’s next.",
                },
                {
                    name: "Farewell",
                    description: "Saying goodbye is never easy — whether it’s a job, a neighborhood, or a community. A farewell is the perfect opportunity to express gratitude, share laughs, and reflect on shared moments. Collect messages, memories, and well wishes to send someone off with love and support. Let them carry the impact they’ve had with them into their next adventure. It’s not just a goodbye, but a celebration of the journey you’ve shared and the legacy they leave behind.",
                },
                {
                    name: "Off to College",
                    description: "Leaving for college is a major life transition — full of excitement, nerves, and new possibilities. Mark this milestone with a memory gift filled with encouragement, advice, and love from family and friends. Whether it’s funny stories or heartfelt wishes, it’s a beautiful way to remind them they’re not alone. As they step into independence and growth, give them a piece of home and a reminder of everyone cheering them on from afar.",
                },
                {
                    name: "Moving Away",
                    description: "When someone moves away, it’s the memories that keep you close. Celebrate this new chapter by reflecting on the time spent together — from the small, everyday moments to the unforgettable ones. Create a tribute filled with messages, inside jokes, and heartfelt farewells. It’s a way to say “You’ll be missed” while wishing them all the best on their journey ahead. Even from miles apart, this keeps your connection strong and their heart full.",
                },
                {
                    name: "Leaving on a Mission",
                    description: "Embarking on a mission is a powerful act of purpose and dedication. Send someone off with strength and support through shared memories, prayers, and messages of love. Whether it’s a spiritual mission, service, or humanitarian effort, let them feel the embrace of their community. A memory gift reminds them of home, values, and the people walking with them in spirit. It’s more than a goodbye — it’s a blessing for their journey ahead.",
                },
                {
                    name: "Terminal Illness",
                    description: "When someone is facing a terminal illness, words of love, strength, and connection can bring comfort in unimaginable ways. Create a space for family and friends to share memories, gratitude, and heartfelt support. It’s not about saying goodbye — it’s about honoring a life while it’s still being lived. A memory gift can become a beautiful reminder that they are deeply loved, never alone, and forever part of something meaningful and enduring.",
                },
                {
                    name: "Other",
                    description: "Not every moment fits into a category — and that’s okay. Whether you’re celebrating something uniquely personal, marking a rare milestone, or creating something simply because it matters, this is your space. Customize your message, collect memories, and craft something one-of-a-kind. The most meaningful occasions are often the unexpected ones. When you want to say something that doesnt have a name, just speak from the heart — because no moment is too small to remember.",
                },
                {
                    name: "Support",
                    description: "Sometimes, people just need to know theyre not alone. Whether theyre going through a tough time, making a big decision, or simply struggling in silence, your words can offer hope and strength. Gather encouraging messages, thoughtful reminders, and small notes of love. A support memory gift becomes a powerful symbol of care — something they can return to when they need a lift. It’s a way to say, “I’m here for you, always.",
                },
                {
                    name: "Get Well",
                    description: "Health struggles can feel isolating — but your care and kindness can bring light. Share uplifting thoughts, favorite memories, and well wishes to help someone heal emotionally while they recover physically. A Get Well memory gift is more than encouragement; it’s a warm reminder that they are surrounded by people who care. Whether it’s a short illness or a longer journey, your words can comfort and restore. Healing happens faster with love close by.",
                },
                {
                    name: "Thank You",
                    description: "Gratitude is a powerful force — it can uplift, inspire, and strengthen connections. Whether it’s a small gesture or a life-changing act, saying “thank you” is important. Collect messages of appreciation, favorite memories, and heartfelt notes to show someone how much they mean to you. A thank you memory gift is a beautiful way to express your gratitude and let them know their impact will never be forgotten. It’s a reminder that kindness matters.",
                },
            ],
            skipDuplicates: true,
        });
        console.log("Seeding completed!");
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
