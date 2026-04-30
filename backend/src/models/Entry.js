const mongoose = require('mongoose')

const EntrySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    date:{
        type: Date,
        required: [true, 'Please provide a date'],
    },
    stress:{
        type: Number,
        required: [true, 'Please provide stress level'],
        min: 1,
        max: 5
    },
    workload:{
        type: Number,
        required: [true, 'Please provide workload level'],
        min: 1,
        max: 5
    },
    sleepHours:{
        type: Number,
        required: [true, 'Please provide sleep hours'],
        min: 0
    },
    energy:{
        type: Number,
        required: [true, 'Please provide energy level'],
        min: 1,
        max: 5
    },
    burnoutScore:{
        type: Number
    },
    burnoutLevel: { 
        type: String, 
        enum: ['Low', 'Medium', 'High']
    },
}, {
    timestamps: true
})

/*Average burnout calculating*/
EntrySchema.statics.getAverageBurnout = async function (userId) {
    const stats = await this.aggregate([
        { $match: { userId: userId } }, 
        { $group: { 
            _id: '$userId', 
            averageScore: { $avg: '$burnoutScore' } 
        }}
    ]);

    if (stats.length > 0) {
        return parseFloat(stats[0].averageScore.toFixed(2));
    } else {
        return 0;
    }
};


EntrySchema.pre('save', async function(next){
    
    /*Sleep Score calculating*/
    let sleepScore;
    if (this.sleepHours < 5) sleepScore = 1;
    else if (this.sleepHours < 6) sleepScore = 2;
    else if (this.sleepHours < 7) sleepScore = 3;
    else if (this.sleepHours < 8) sleepScore = 4;
    else sleepScore = 5;

    /*Burnout Score calculating*/
    const rawScore = (
        (0.4 * this.stress) + 
        (0.3 * this.workload) + 
        (0.2 * (5 - sleepScore)) + 
        (0.1 * (5 - this.energy))
    );

    this.burnoutScore = parseFloat(rawScore.toFixed(2));
    
    if (this.burnoutScore < 2.0) {
        this.burnoutLevel = 'Low';
    } else if (this.burnoutScore <= 3.5) {
        this.burnoutLevel = 'Medium';
    } else {
        this.burnoutLevel = 'High';
    }
    next(); 
    });

module.exports = mongoose.model('Entry', EntrySchema)