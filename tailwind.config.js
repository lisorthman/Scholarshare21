module.exports = {
    theme: {
      extend: {
        colors: {
          custom: {
            DEFAULT: '#634141', // Add your custom color
            hover: '#4a3030', // Add a darker shade for hover
          },
        },
      },
    },
  };

  <div
  className={`transition-all duration-300 ${
    isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
  }`}
>
  <Sidebar role="admin" />
</div>