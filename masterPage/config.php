<?php

$_env = 'local';

	class config {

		public function __construct() {
			
		}

		public function getDSN() {
			global $_env;
			if ($_env == 'local') {
				return 'mysql://root@127.0.0.1/youmixdb';
			}
			else
			{
				return 'mysql://seh264:obvious@mysql.you-mix.com/youmixdb';
			}
		}

		public function getSMTPPass() {
			return 'Obviously1##';
		}

		public function getUserManagerDomain() {
			global $_env;
			if ($_env == 'local') {
				return '127.0.0.1';
			}
			else
			{
				return 'mysql.you-mix.com';
			}
		}

		public function getUserManagerPass() {
			return 'obvious';
		}


	}

?>