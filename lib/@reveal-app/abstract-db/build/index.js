"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const quiz_1 = require("./quiz");
const util_1 = require("./util");
exports.generateSecret = util_1.generateSecret;
class Table {
    async getSafeId(src) {
        const ids = (await this.find({}, {
            offset: 0,
            fields: ["_id"]
        })).data.map((el) => el._id);
        return util_1._getSafeId(ids, src);
    }
    async findOne(q) {
        return (await this.find(q, {
            offset: 0,
            limit: 1
        })).data[0] || null;
    }
    async findById(id) {
        return await this.findOne({ _id: id });
    }
}
exports.Table = Table;
class AbstractDb {
    constructor(isLocal = false) {
        this.isLocal = isLocal;
        this._user = null;
    }
    get user() {
        if (this._user) {
            return this._user;
        }
        else if (this.isLocal) {
            return new UserDb(this);
        }
        throw new Error("Not logged in");
    }
    async signup(email, password = null, options) {
        let user = await this.tables.user.findOne({ email });
        if (!user) {
            user = await this.tables.user.create({
                email,
                ...options
            });
        }
        this._user = new UserDb(this, user._id);
        return user;
    }
    async login(email, secret) {
        const user = await this.tables.user.findOne({ email, secret });
        if (!user) {
            throw new Error("Not logged in");
        }
        this._user = new UserDb(this, user._id);
    }
    logout() {
        this._user = null;
    }
    async newSecret() {
        const { userId } = this.user;
        if (!userId) {
            throw new Error("Not logged in");
        }
        const secret = await util_1.generateSecret();
        await this.tables.user.updateById(userId, { secret });
        return secret;
    }
    async getSecret() {
        const { userId } = this.user;
        if (!userId) {
            throw new Error("Not logged in");
        }
        const user = await this.tables.user.findById(userId);
        const secret = user ? user.secret : null;
        if (!secret) {
            throw new Error("User not found");
        }
        return secret;
    }
    async parseSecret(secret) {
        const user = await this.tables.user.findOne({ secret });
        if (!user) {
            throw new Error("Not logged in");
        }
        this._user = new UserDb(this, user._id);
    }
}
exports.default = AbstractDb;
class UserDb {
    constructor(db, user) {
        this.db = db;
        this.user = user;
    }
    get userId() {
        return this.user || null;
    }
    async markRight(card) {
        return this.updateSrsLevel(+1, card);
    }
    async markWrong(card) {
        return this.updateSrsLevel(-1, card);
    }
    async updateSrsLevel(dSrsLevel, card) {
        let cardId;
        if (typeof card === "string") {
            cardId = card;
        }
        else if (!card._id) {
            const { key } = card;
            if (!key) {
                throw new Error("CardId or Key not specified");
            }
            const c = await this.db.tables.card.findOne({ key });
            if (c) {
                cardId = c._id;
            }
            else {
                cardId = (await this.db.tables.card.create({
                    tag: [],
                    key,
                    front: key,
                    ...card,
                    _id: await this.db.tables.card.getSafeId(key)
                }))._id;
            }
        }
        else {
            cardId = card._id;
        }
        let quiz = await this.db.tables.quiz.findOne({ card: cardId });
        if (!quiz) {
            const q = {
                user: this.user,
                card: cardId,
                srsLevel: 0,
                nextReview: new Date(),
                tag: [],
                stat: {
                    streak: {
                        right: 0,
                        wrong: 0
                    }
                }
            };
            quiz = q;
        }
        if (dSrsLevel > 0) {
            quiz.stat.streak.right += 1;
            quiz.stat.streak.wrong = 0;
        }
        else if (dSrsLevel < 0) {
            quiz.stat.streak.wrong += 1;
            quiz.stat.streak.right = 0;
        }
        quiz.srsLevel += dSrsLevel;
        if (quiz.srsLevel >= quiz_1.srsMap.length) {
            quiz.srsLevel = quiz_1.srsMap.length - 1;
        }
        if (quiz.srsLevel < 0) {
            quiz.srsLevel = 0;
        }
        if (dSrsLevel > 0) {
            quiz.nextReview = quiz_1.getNextReview(quiz.srsLevel);
        }
        else {
            quiz.nextReview = quiz_1.repeatReview();
        }
        let { _id } = quiz;
        if (_id) {
            await this.db.tables.quiz.updateById(_id, quiz);
        }
        else {
            _id = (await this.db.tables.quiz.create(quiz))._id;
        }
        return _id;
    }
    ;
}
