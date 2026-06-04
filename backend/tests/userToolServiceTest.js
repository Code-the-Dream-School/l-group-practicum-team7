const { expect } = require('chai');
const {
  getUnlockedToolsForUser,
  unlockToolForUser,
} = require('../src/services/dialogueService');

const { createTestUser, clearDatabase } = require('./helpers');
const UserTool = require('../src/models/UserTool');

describe('UserTool service', () => {
  let user;

  beforeEach(async () => {
    await clearDatabase();
    const created = await createTestUser();
    user = created.user;
  });

  it('rejects unlocking tool when key or title missing', async () => {
    try {
      await unlockToolForUser(user.id, {});
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).to.exist;
      expect(err.statusCode).to.equal(400);
    }
  });

  it('unlocks tool and retrieves it per user', async () => {
    const tool = await unlockToolForUser(user.id, {
      key: 'ut1',
      title: 'User Tool 1',
      sourceDialogue: 'highWorkload',
    });

    expect(tool).to.have.property('key', 'ut1');

    const tools = await getUnlockedToolsForUser(user.id);
    expect(Array.isArray(tools)).to.be.true;
    expect(tools.length).to.equal(1);
    expect(tools[0].key).to.equal('ut1');
  });

  it('upsert does not duplicate the same key', async () => {
    await unlockToolForUser(user.id, { key: 'ut2', title: 'Tool 2' });
    await unlockToolForUser(user.id, { key: 'ut2', title: 'Tool 2' });

    const tools = await getUnlockedToolsForUser(user.id);
    const found = tools.filter((t) => t.key === 'ut2');
    expect(found.length).to.equal(1);
  });
});
