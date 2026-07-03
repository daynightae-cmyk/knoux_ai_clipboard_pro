import express from 'express';
import { VoiceCustomizer } from '../ai/voice-customizer';
import { ProductivityScorer } from '../ai/productivity-scorer';
import { VoiceProfile, VoiceConversionResult, VoiceSynthesisRequest } from '../../shared/voice-contracts';

const router = express.Router();
const voiceCustomizer = new VoiceCustomizer();
const productivityScorer = new ProductivityScorer();

// Voice API Endpoints
router.post('/voice/synthesize', async (req, res) => {
  const request: VoiceSynthesisRequest = req.body;
  const result = await voiceCustomizer.synthesizeText(request.text, request.profileId, request.options);
  res.json(result);
});

router.post('/voice/convert', async (req, res) => {
  const { audioUrl, targetProfile } = req.body;
  const result = await voiceCustomizer.convertVoice(audioUrl, targetProfile);
  res.json(result);
});

router.get('/voice/profiles', async (req, res) => {
  const profiles = await voiceCustomizer.getAvailableProfiles();
  res.json(profiles);
});

router.post('/voice/profiles', async (req, res) => {
  const profile: VoiceProfile = req.body;
  const created = await voiceCustomizer.createProfile(profile);
  res.json(created);
});

// Productivity API Endpoints
router.post('/productivity/score', async (req, res) => {
  const { userId, timeframe } = req.body;
  const score = await productivityScorer.calculateScore(userId, timeframe);
  res.json(score);
});

router.get('/productivity/:userId/progress', async (req, res) => {
  const { userId } = req.params;
  const { start, end } = req.query;
  const progress = await productivityScorer.getProgress(userId, start as string, end as string);
  res.json(progress);
});

router.post('/productivity/:userId/recommendation/:id/apply', async (req, res) => {
  const { userId, id } = req.params;
  const result = await productivityScorer.applyRecommendation(userId, id);
  res.json(result);
});

export default router;