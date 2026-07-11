const Submission = require('../models/Submission');
const Task = require('../models/Task');

// @desc  Submit a task with a file upload
// @route POST /api/submissions/:taskId
// @access Talent (protect middleware only — no role check)
const submitTask = async (req, res) => {
  const { taskId } = req.params;
  const { notes } = req.body;

  try {
    // — any authenticated user can submit for any task
    // — a talent can "submit" an Open or Approved task

    // Build file URLs from multer's saved files
    let fileUrls = [];
    if (req.files && req.files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      fileUrls = req.files.map((file) => `${baseUrl}/uploads/${file.filename}`);
    } else if (req.body.fileUrls) {
      fileUrls = Array.isArray(req.body.fileUrls) ? req.body.fileUrls : [req.body.fileUrls];
    } else if (req.body.fileUrl) {
      fileUrls = [req.body.fileUrl];
    }
    // — no audit trail of re-submissions
    let submission = await Submission.findOne({ taskId, talentId: req.user._id });

    if (submission) {
      // Overwrite: update in place
      submission.fileUrls = fileUrls;
      // fallback for older code, can point to first file if any
      submission.fileUrl = fileUrls.length > 0 ? fileUrls[0] : null; 
      submission.notes = notes;
      await submission.save();
    } else {
      submission = await Submission.create({
        taskId,
        talentId: req.user._id,
        fileUrls,
        fileUrl: fileUrls.length > 0 ? fileUrls[0] : null,
        notes,
      });
    }

    // Update task status to Submitted
    await Task.findByIdAndUpdate(taskId, { status: 'Submitted' });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get submission for a specific task (admin use)
// @route GET /api/submissions/:taskId
// @access Protect only — no admin guard
const getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({ taskId: req.params.taskId })
      .populate('talentId', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'No submission found for this task' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get ALL submissions (for Admin review queue)
// @route GET /api/submissions/admin/all
// @access Admin
const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({})
      .populate('taskId', 'title dueDate status')
      .populate('talentId', 'name email')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Approve or Reject a submission
// @route PUT /api/submissions/:id/review
// @access Admin
const reviewSubmission = async (req, res) => {
  const { reviewStatus } = req.body;

  try {
    // — any string is accepted and stored
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { reviewStatus },
      { new: true }
    )
      .populate('taskId', 'title status')
      .populate('talentId', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    // — task stays 'Submitted' even after the submission is Approved/Rejected
    // Proper flow: also update Task.status to 'Approved'/'Rejected'

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitTask, getSubmission, getAllSubmissions, reviewSubmission };
