PressGang WordPress Manager
===========================

PressGang is a Django application that makes it easy to manage multiple
WordPress installations on a single server.  Using it, you can install blogs,
lock them down and perform easy rollbacks to previous versions.

PressGang can install any blogs using WordPress 3.0 or greater, and can still
perform some basic management tasks on older blogs.  For the moment, it is only
capable of dealing with blogs installed in subdirectories, and does not support
subdomain installations.

Installation
------------

**Installation**

        git clone git://github.com/cilcoberlin/pressgang.git
        python pressgang/setup.py install
        rm -R pressgang

**File Structure**

1. Create a directory that is writable by your app to contain blog versions.
2. Create a directory that is writable by your app to contain per-blog Apache configuration files.
3. Copy the contents of the media/ directory to your site's media directory.

**Apache**

Somewhere in your Apache configuration file, add the following line, replacing
`CONFIG_DIR` with the full path to the directory created in step 2 of the
previous section:

        Include CONFIG_DIR/*.conf

**Settings**

1. Add 'pressgang' to settings.INSTALLED_APPS.
2. Include 'pressgang.urls' in your URL configuration.
3. Provide values for the settings below.

`PRESSGANG_APACHE_CONFIGS_DIR`
A string of the absolute path to the directory that you created to hold per-blog Apache configuration files.

`PRESSGANG_APACHE_DOCUMENT_ROOT`
A string that should match the value of Apache's DocumentRoot.

`PRESSGANG_APACHE_RELOAD_CMD`
A string of the full command that will gracefully reload Apache on your server.

`PRESSGANG_BACKUPS_DIR`
A string of the absolute path to the directory that you created to hold the blog backup files.

`PRESSGANG_DB_ADMIN_PASSWORD`
A string of the password for the admin use for your MySQL installation.

`PRESSGANG_DB_ADMIN_USER`
A string of the username of the admin user for your MySQL installation.

`PRESSGANG_INSTALLERS`
An optional list containing strings of the full paths to any custom installer
packages that you have created.  Each item in the list must be on your Python path.

`PRESSGANG_MYSQL_PATH`
The full path to your mysql executable.

`PRESSGANG_MYSQLDUMP_PATH`
The full path to your mysqldump executable.

`PRESSGANG_SERVER_BASE`
A string of the network location (i.e., 'subdomain.server.tld') of the server hosting your blogs.

**Standalone Settings***

If PressGang is the only application that you are running, you can use the following
values for your settings.py variables, replacing **PRESSGANG_PREFIX** with the optional
URL prefix of your PressGang site, if it is running in a subdirectory.

        LOGIN_URL  = '**PRESSGANG_PREFIX**/accounts/login'
        LOGOUT_URL = '**PRESSGANG_PREFIX**/accounts/logout'

To have PressGang handle any 404 or 500 errors, you can set the following values
in your main URL configuration.

        handler404 = 'pressgang.core.views.handle_404'
        handler500 = 'pressgang.core.views.handle_500'

**Permissions**

Any user that you add to your site must have certain permissions to be able
to use PressGang.  The possible permissions, given as how they show up in the
list of permissions available to users and groups, are:

`pressgang | blog | can install blogs`
Allows the user to install blogs

`pressgang | blog | can manage blogs`
Allows the user to make changes to the blogs.

`pressgang | blog | can view blogs`
Allows the user to view a list of all installed blogs.

Generally, a user will have all of the above permissions, but it is possible to
restrict the permissions if desired.
