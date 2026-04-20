<?php
/**
 * POST /auth/forgot-password.php
 *
 * Current schema note:
 * - barkada_db does not yet include password reset tokens.
 *
 * TODO:
 * - Add a reset_tokens table or another secure token strategy.
 * - Email the reset link only after token storage is ready.
 */
