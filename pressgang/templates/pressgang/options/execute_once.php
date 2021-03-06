
if ( ! function_exists( '{{ function }}' ) ) {
	function {{ function }}() {

		// Don't run the function if we're not an admin on the admin page
		if ( ! current_user_can( 'manage_options' ) || ! is_admin() ) {
			return;
		}

		// Get our stored list of executed pressgang options functions
		$executed_functions = get_option( 'pressgang_functions' );
		if ( empty( $executed_functions ) ) {
			$executed_functions = array();
		}

		// Only run the code if it has not yet been flagged as run
		if ( ! in_array( '{{ function }}', $executed_functions ) ) {
			{{ code|safe }}

			// Add the function to our list of executed ones
			$executed_functions[] = '{{ function }}';
			update_option( 'pressgang_functions', $executed_functions );
		}
	}
}
add_action( 'admin_init', '{{ function }}' );
