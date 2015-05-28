# How to contribute

## Maintainer

Hans Lemuet <hans@etaminstudio.com>

## Fix a bug or improve existing code

First, clone the repository:

    $ git clone git@git.etaminstudio.com:lscp/app.git

If this command fails, you probably have to add your SSH key here: http://git.etaminstudio.com/profile/keys and try again.

By default, you will be on the `develop` branch.

    $ cd app
    $ git status
    # On branch develop
    nothing to commit, working directory clean

Let's create a branch for your contribution, based on `develop`.
For this example, we call it `my_contribution`. Please use a explicit name, depending on your contribution.

    $ git checkout -b my_contribution develop

Now you can make your changes. Most of the time you want to modify files in the `app` directory.

Once your changes are made, commit them.

    $ git add app/
    $ git commit -m "A short message explaining your changes"

Then, push your new branch to the remote repository.

    $ git push origin my_contribution

You can now get back to the `develop` branch.

    $ git checkout develop

We want the maintainer of the repository to merge our changes, so we'll now create a "merge request".
Login to http://git.etaminstudio.com/lscp/app/merge_requests

Click on "New Merge Request".

On the left side ("Source branch"), pick your branch (`my_contribution` in our example). Leave `develop` as the "Target branch".

Click on "Compare branches".

Set an explicit title. If necessary, add more information about your changes in the "Description" field.

Assign the merge request to the maintainer.

Click on "Submit merge request".

The maintainer will now review your request and merge it to the repository. He will then release a new version of the app.

Once this is done, you can update your local repository:

    $ git pull origin develop

You can also delete your local branch, which is no longer useful:

    $ git branch -d my_contribution

Thanks for your contribution!