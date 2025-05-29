
function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Index />} />
        <Route element={<ProtectedRoute />}>
          {/* <Route path="/dashboard" element={<DashboardMatrics />} /> */}
        </Route>

      </Routes>

      <Toaster />
      <DataButtonLoader />
    </>
  )
}

export default App
