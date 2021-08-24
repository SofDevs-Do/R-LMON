# R-LMON
This is a light-weight system monitoring tool for cluster machines.

## Installation
### On monitoring machine
1) Clone this repository as `$HOME/.r_lmon` directory.
`
$ git clone https://github.com/SofDevs-Do/R-LMON
`

2) Configure/update the `machinefile` located at `$HOME/.r_lmon/machinefile`. You will have to add a unique machine ID, username@IP, unique room ID, unique rack ID, and position of the machine in the rack in a new line. You may use '`#`' as a single line comment in this file, spaces and tabs are allowed in the file for your convinience. However, leading and trailing spaces, tabs will not be ignored.

3) Setup a cron job to collect regular data from all of the machines listed in `$HOME/.r_lmon/machinefile`. 
- Take a backup of your existing cron jobs
`
$ crontab -l > $HOME/user-cron-backup.cron
`
You may setup the `r_lmon` cron job by running the following command
`
$ crontab $HOME/.r_lmon/core_backend/scripts/main.cron
`

4) Collection of data, storage, and serving of data for viewing is done as shown below:
<img alt="Arch-image" src="/images/R-LMON-arch.png">

5) Configure the `serverfile.yaml`
`db_url` - IP:Port of the Mongo-DB server
`core_backend_url` - IP:Port of the backend-server

6) Start the web-application front-end
`
$ gunicorn main:app --bind 127.0.0.1:8000
`
Change the above IP from `127.0.0.1` to any IP for it to be accessed in the LAN.

7) Visit the web-application front-end IP (here `127.0.0.1:8000`)

### On machines to be monitored
1) Install dependencies 
`
$ sudo apt install openssh-server sysstat
`

2) Check if `sar` can collect system activity information.
   - change the `ENABLED` variable in `/etc/default/sysstat` file to `true`
   - Restart sysstat by running the following command 
`
 $ sudo service sysstat restart
`

3) Enable remote `ssh` logins without password by appending the *monitoring machine's* ssh-public key to the `~/.ssh/authorized_keys` file in the cluster machine.
   - Generate ssh-public key on the *monitoring* machine **if it does not exist already** you need to generate it only ONCE. Fowllow the instructions given [here](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04). Leave the passphrase empty, as the tool has not been tested with having a passphrase.
   - Copy over the public key of *monitoring machine* to **all** of the monitored machine's `root` users.
   Example:
   **On monitoring machine**
     ```
     $ cat ~/.ssh/id_rsa.pub | ssh <monitored-machine-1-user>@<monitored-machine1-IP> "cat >> /tmp/id_rsa.pub"
     ```

	 **On monitored machine (monitored-machine-1)**
	 Log into monitored-machine-1
	 ```
	 $ ssh <monitored-machine-1-user>@<monitored-machine1-IP>
	 ```
	 Append the contents of `/tmp/id_rsa.pub` file to `/root/.ssh/authorized_keys` file
	 ```
	 $ su
	 $ cd ~
	 $ mkdir -p .ssh
	 $ cat /tmp/id_rsa.pub >> .ssh/authorized_keys
	 $ chmod 600 .ssh/authorized_keys
	 ```
	 **NOTE**: There is a security threat while performing the the `cat` operation above, as someone with access to any user on the machine can easily replace the `/tmp/id_rsa.pub` file. Please verify the contents of the file before appending to the `/root/.ssh/authorized_keys` file. If the `root` user is not used in the *monitored machines*, then functions like `shutdown` and `reboot` will not work from the tool, all other functions will continue to work.
	 
   - Add the details of `<monitored-machine-1>` in the `$HOME/.r_lmon/machinefile` file present on *monitoring machine*.
   
