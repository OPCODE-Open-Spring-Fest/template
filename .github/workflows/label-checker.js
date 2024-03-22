const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const octokit = new github.getOctokit(token);

    const pullRequest = github.context.payload.pull_request;
    const owner = pullRequest.base.repo.owner.login;
    const repo = pullRequest.base.repo.name;
    const pullNumber = pullRequest.number;

    const { data: labels } = await octokit.rest.issues.listLabelsOnIssue({
      owner,
      repo,
      issue_number: pullNumber,
    });

    const labelNames = labels.map((label) => label.name);

    const requiredLabels = [
      ['Type:Easy', 'Type:Medium', 'Type:Hard'],
      ['Semver:Major', 'Semver:Minor', 'Semver:Patch'],
      ['PR:Accept'],
    ];

    const hasRequiredLabels = requiredLabels.every((labelGroup) =>
      labelGroup.some((label) => labelNames.includes(label))
    );

    if (!hasRequiredLabels) {
      core.setFailed(
        'This pull request must have at least one label from each of the following groups: Type (Easy, Medium, Hard), Semver (Major, Minor, Patch), and PR:Accept.'
      );
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();