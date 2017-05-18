
'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');


var ProgressSchema = new Schema({

    applicant: {
        type: Schema.Types.ObjectId, ref: 'Applicant'
    },
    position: {
        type: Schema.Types.ObjectId, ref: 'Position'
    },
    viewed: {
        type: Date
    },
    accepted: {
        type: Date
    },
    interviewTime:{
        type: Date
    },
    interviewAddress:{
        type: String
    },
    resume: {
        type: Schema.Types.ObjectId, ref: 'Resume'
    },
    contact: {
        type: String
    },
    contactPhone: {
        type: String
    },
    content: {
        type: String
    },
    feedback: {
        type: Boolean
    }
});

mongoose.model('Progress', ProgressSchema);
