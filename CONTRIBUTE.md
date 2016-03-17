# How to contribute

## Maintainer

Hans Lemuet <hans@etaminstudio.com>

## Git workflow

We follow the workflow described here: https://gist.github.com/Spone/f4e7f915df96069b5923

## Fix a bug or improve existing code

First, clone the repository:

    $ git clone git@git.etaminstud.io:lscp/app.git

If this command fails, you probably have to add your SSH key here: https://git.etaminstud.io/profile/keys and try again.

By default, you will be on the `master` branch.

    $ cd app
    $ git status
    # On branch master
    nothing to commit, working directory clean

Let's create a branch for your contribution, based on `master`.
For this example, we call it `my-contribution`. Please use a specific name, depending on your contribution.

    $ git checkout -b my-contribution

Now you can make your changes. Most of the time you want to modify files in the `app` directory.

Once your changes are made, commit them.

    $ git add app/
    $ git commit -m "A short message explaining your changes"

Rebase to make sure you will keep changes made by other developers on your branch and `master`.

    $ git fetch origin
    $ git rebase origin/my-contribution
    $ git rebase origin/master

Then, push your new branch to the remote repository.

    $ git push origin my-contribution

You can now get back to the `master` branch.

    $ git checkout master

We want the maintainer of the repository to merge our changes, so we'll now create a "merge request".
Login to http://git.etaminstud.io/lscp/app/merge_requests

Click on "+ New Merge Request".

On the left side ("Source branch"), pick your branch (`my-contribution` in our example). Leave `master` as the "Target branch".

Click on "Compare branches".

Set an explicit title. If necessary, add more information about your changes in the "Description" field.

Assign the merge request to the maintainer.

Click on "Submit merge request".

The maintainer will now review your request and merge it to the repository. He will then release a new version of the app.

Once this is done, you can update your local repository:

    $ git pull origin master

You can also delete your local branch, which is no longer useful:

    $ git branch -d my-contribution

Thanks for your contribution!
