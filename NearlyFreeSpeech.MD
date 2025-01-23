TOdo
 - [ ] Remove GCP Stuff
 - [ ] Move this to readme to where it's appropriate. 

 https://faq.nearlyfreespeech.net/q/sshkeys


1. Create new site
    - https://members.nearlyfreespeech.net/[username]/sites
1. Get site specific SSH username from site page
    - https://members.nearlyfreespeech.net/[username]/[site]
1. Create a new SSH Key
    - https://members.nearlyfreespeech.net/[username]/profile/add_ssh_key
1. Update SSH config 
    - `code ~/.ssh/config`
```
Host nfs_[site]
    HostName ssh.nyc1.nearlyfreespeech.net
    User [username]
IdentityFile ~/.ssh/nfs_key
```

1. Login 
    - Terminal `ssh nfs_[site]`
    - (Not Working) VS Code
        1. Command menu: `Connect to host`
        1. Enter `ssh nfs_[site]` and select `~/.ssh/config` file.