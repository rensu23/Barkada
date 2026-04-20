<?php
/**
 * POST /groups/create.php
 *
 * Expected request fields:
 * - group_name
 * - description
 * - target_amount
 * - deadline
 * - join_code
 *
 * TODO:
 * - Insert the group using groups table fields.
 * - Use the logged-in user as groups.treasurer_id.
 * - Insert the creator into group_members with role = Treasurer.
 */
